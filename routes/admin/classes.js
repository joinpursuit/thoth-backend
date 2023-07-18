const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// CREATE a new class
router.post('/', async (req, res) => {
  const { name, template } = req.body;

  try {
    // Fetch the course template first
    const courseTemplate = await prisma.courseTemplate.findUnique({
      where: { id: Number(template) },
      include: {
        modules: {
          include: {
            topics: true,
          },
        },
      },
    });

    if (!courseTemplate) {
      return res.status(404).json({ error: 'Course template not found' });
    }

    console.log(courseTemplate)

    // Begin a transaction
    const newClass = await prisma.class.create({
      data: {
        name,
        modules: {
          create: courseTemplate.modules.map((moduleTemplate) => ({
            name: moduleTemplate.name,
            topics: {
              create: moduleTemplate.topics.map((topicTemplate) => ({
                name: topicTemplate.name,
                objectives: topicTemplate.objectives,
              })),
            },
          })),
        },
      },
    })

    res.status(201).json(newClass);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while creating a new class' });
  }
});


// READ all classes
router.get('/', async (req, res) => {
  try {
    const classes = await prisma.class.findMany(); // change 'class' to your class model name

    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong while fetching the classes' });
  }
});

// READ a single class by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const classObj = await prisma.class.findUnique({ // change 'class' to your class model name
      where: { id: Number(id) },
    });

    if (classObj) {
      res.status(200).json(classObj);
    } else {
      res.status(404).json({ error: 'Class not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong while fetching the class' });
  }
});

// UPDATE a class by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const updatedClass = await prisma.class.update({ // change 'class' to your class model name
      where: { id: Number(id) },
      data: { name },
    });

    res.status(200).json(updatedClass);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong while updating the class' });
  }
});

// DELETE a class by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedClass = await prisma.class.delete({ // change 'class' to your class model name
      where: { id: Number(id) },
    });

    res.status(200).json(deletedClass);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong while deleting the class' });
  }
});

router.get('/:id/modules', async (req, res) => {
  const { id } = req.params;

  try {
    const modules = await prisma.module.findMany({
      where: {
        classId: Number(id),
      },
      include: {
        topics: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    res.status(200).json(modules);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong while fetching modules' });
  }
});


router.get('/:id/memberships', async (req, res) => {
  const { id } = req.params;
  
  try {
    const memberships = await prisma.classMembership.findMany({
      where: { classId: Number(id) },
      include: {
        user: true
      }
    });
  
    res.json(memberships);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong while fetching class memberships.' });
  }
});

router.get('/:id/invitations', async (req, res) => {
  const { id } = req.params;

  try {
    const invitations = await prisma.classInvitation.findMany({
      where: { classId: Number(id) },
    });
  
    res.json(invitations);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong while fetching class invitations.' });
  }
});

router.post('/:id/invitations', async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    console.log(user);

    if (user) {
      const member = await prisma.classMembership.create({
        data: {
          classId: Number(id),
          userId: user.id,
        },
      });
      res.status(201).json({ member });
    } else {
      const invitation = await prisma.classInvitation.create({
        data: {
          classId: Number(id),
          email,
        },
      });
      res.status(201).json({ invitation });
    }
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong while adding a member/invitation.' });
  }
});



module.exports = router;
