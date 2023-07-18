const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// CREATE a new CourseTemplate
router.post('/', async (req, res) => {
  const { name } = req.body;

  try {
    const newCourse = await prisma.courseTemplate.create({
      data: { name }
    });
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// READ all CourseTemplates
router.get('/', async (req, res) => {
  try {
    const allCourses = await prisma.courseTemplate.findMany();
    console.log(allCourses);
    res.status(200).json(allCourses);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// READ a CourseTemplate by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const course = await prisma.courseTemplate.findUnique({
      where: { id: parseInt(id) }
    });
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// UPDATE a CourseTemplate by id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const updatedCourse = await prisma.courseTemplate.update({
      where: { id: parseInt(id) },
      data: { name }
    });
    res.status(200).json(updatedCourse);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// DELETE a CourseTemplate by id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.courseTemplate.delete({
      where: { id: parseInt(id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.get('/:id/module_templates', async (req, res) => {
  const { id } = req.params;

  try {
    // Find the CourseTemplate by the provided id
    const courseTemplate = await prisma.courseTemplate.findUnique({
      where: { id: Number(id) },
    });

    if (!courseTemplate) {
      return res.status(404).json({ error: `CourseTemplate with id ${id} not found` });
    }

    // Get the ModuleTemplates associated with this CourseTemplate
    const moduleTemplates = await prisma.moduleTemplate.findMany({
      where: { courseTemplateId: Number(id) },
      include: {
        topics: {
          orderBy: {
            id: 'asc', // Order by id in ascending order
        }}, // Include the related TopicTemplates
      },
      orderBy: {
        id: 'asc', // Order by id in ascending order
      },
    });

    // Return the ModuleTemplates
    res.status(200).json(moduleTemplates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the ModuleTemplates' });
  }
});


router.put('/:id/module_templates/:modId', async (req, res) => {
  const { id, modId } = req.params;
  const { name } = req.body;
  
  try {
    // Check if course template exists
    const courseTemplate = await prisma.courseTemplate.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!courseTemplate) {
      return res.status(404).json({ error: 'Course template not found' });
    }

    // Check if module template exists
    const moduleTemplate = await prisma.moduleTemplate.findUnique({
      where: {
        id: parseInt(modId),
      }
    });

    if (!moduleTemplate) {
      return res.status(404).json({ error: 'Module template not found' });
    }

    // Update the module template
    const updatedModuleTemplate = await prisma.moduleTemplate.update({
      where: {
        id: parseInt(modId),
      },
      data: {
        name,
      },
      include: {
        topics: true,
      }
    });

    res.status(200).json(updatedModuleTemplate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating module template' });
  }
});


router.post('/:id/module_templates', async (req, res) => {
  const { id } = req.params;

  try {
    // First, find the CourseTemplate by the provided id
    const courseTemplate = await prisma.courseTemplate.findUnique({
      where: { id: Number(id) },
    });

    if (!courseTemplate) {
      return res.status(404).json({ error: `CourseTemplate with id ${id} not found` });
    }

    // Create a new ModuleTemplate with default fields
    const newModuleTemplate = await prisma.moduleTemplate.create({
      data: {
        name: '',
        courseTemplate: {
          connect: {
            id: Number(id),
          },
        },
      },
    });

    // Return the new ModuleTemplate
    res.status(201).json({...newModuleTemplate, topics: []});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the ModuleTemplate' });
  }
});

router.delete('/:id/module_templates/:modId', async (req, res) => {
  const { id, modId } = req.params;

  try {
    // Find the ModuleTemplate by the provided id
    const moduleTemplate = await prisma.moduleTemplate.findUnique({
      where: { id: Number(modId) },
    });

    if (!moduleTemplate) {
      return res.status(404).json({ error: `ModuleTemplate with id ${modId} not found` });
    }

    // Delete the ModuleTemplate
    const deletedModuleTemplate = await prisma.moduleTemplate.delete({
      where: { id: Number(modId) },
    });

    // Return a success message
    res.status(200).json({ message: `ModuleTemplate with id ${modId} was deleted successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while deleting the ModuleTemplate' });
  }
});

router.post('/:id/module_templates/:modId/topic_templates', async (req, res) => {
  const { id, modId } = req.params;
  const { name, objectives } = req.body;

  try {
    // Check if the CourseTemplate and ModuleTemplate exist
    const courseTemplate = await prisma.courseTemplate.findUnique({
      where: { id: Number(id) },
    });

    const moduleTemplate = await prisma.moduleTemplate.findUnique({
      where: { id: Number(modId) },
    });

    if (!courseTemplate || !moduleTemplate) {
      return res.status(404).json({ error: `CourseTemplate with id ${id} or ModuleTemplate with id ${modId} not found` });
    }

    // Create the TopicTemplate
    const newTopicTemplate = await prisma.topicTemplate.create({
      data: {
        name: name,
        objectives: objectives,
        moduleTemplateId: Number(modId)
      },
    });

    // Return the created TopicTemplate
    res.status(201).json(newTopicTemplate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the TopicTemplate' });
  }
});

router.delete('/:id/module_templates/:modId/topic_templates/:topId', async (req, res) => {
  const { id, modId, topId } = req.params;

  try {
    // Find the ModuleTemplate by the provided id
    const moduleTemplate = await prisma.moduleTemplate.findUnique({
      where: { id: Number(modId) },
    });

    if (!moduleTemplate) {
      return res.status(404).json({ error: `ModuleTemplate with id ${modId} not found` });
    }

    // Find the TopicTemplate by the provided id
    const topicTemplate = await prisma.topicTemplate.findUnique({
      where: { id: Number(topId) },
    });

    if (!topicTemplate) {
      return res.status(404).json({ error: `TopicTemplate with id ${topId} not found` });
    }

    // Delete the TopicTemplate
    await prisma.topicTemplate.delete({
      where: { id: Number(topId) },
    });

    // Return a success message
    res.status(200).json({ message: `TopicTemplate with id ${topId} deleted successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while deleting the TopicTemplate' });
  }
});

router.put('/:id/module_templates/:modId/topic_templates/:topId', async (req, res) => {
  const { id, modId, topId } = req.params;
  const { name, objectives } = req.body;

  try {
    // Find the ModuleTemplate by the provided id
    const moduleTemplate = await prisma.moduleTemplate.findUnique({
      where: { id: Number(modId) },
    });

    if (!moduleTemplate) {
      return res.status(404).json({ error: `ModuleTemplate with id ${modId} not found` });
    }

    // Find the TopicTemplate by the provided id
    const topicTemplate = await prisma.topicTemplate.findUnique({
      where: { id: Number(topId) },
    });

    if (!topicTemplate) {
      return res.status(404).json({ error: `TopicTemplate with id ${topId} not found` });
    }

    // Update the TopicTemplate
    const updatedTopicTemplate = await prisma.topicTemplate.update({
      where: { id: Number(topId) },
      data: {
        name,
        objectives,
      },
    });

    // Return the updated TopicTemplate
    res.status(200).json(updatedTopicTemplate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating the TopicTemplate' });
  }
});


module.exports = router;
