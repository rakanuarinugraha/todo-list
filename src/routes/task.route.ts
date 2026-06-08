import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ message: "Tasks fetched", data: tasks });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Old Code
router.post("/", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { title } = req.body;

  try {
    const task = await prisma.task.create({
      data: { title, userId: req.userId as string },
    });
    res.status(201).json({ message: "Task created", data: task });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

// New Code
router.post("/", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { title } = req.body;

  if (!title || typeof title !== "string" || title.trim() === "") {
    res.status(400).json({ message: "Title is required and must be a non-empty string" });
    return;
  }

  if (title.trim().length > 100) {
    res.status(400).json({ message: "Title must not exceed 100 characters" });
    return;
  }

  try {
    const task = await prisma.task.create({
      data: { title: title.trim(), userId: req.userId as string },
    });
    res.status(201).json({ message: "Task created", data: task });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/:id", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const { isDone } = req.body;

  try {
    const task = await prisma.task.findFirst({
      where: { id, userId: req.userId },
    });

    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    const updated = await prisma.task.update({
      where: { id },
      data: { isDone },
    });
    res.status(200).json({ message: "Task updated", data: updated });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

// New Code
router.patch("/:id", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const { isDone } = req.body;

  if (typeof isDone !== "boolean") {
    res.status(400).json({ success: false, message: "isDone must be a boolean value", data: null });
    return;
  }

  try {
    const task = await prisma.task.findFirst({
      where: { id },
    });

    if (!task) {
      res.status(404).json({ success: false, message: "Task not found", data: null });
      return;
    }

    if (task.userId !== req.userId) {
      res.status(403).json({ success: false, message: "Forbidden: you do not own this task", data: null });
      return;
    }

    const updated = await prisma.task.update({
      where: { id },
      data: { isDone },
    });
    res.status(200).json({ success: true, message: "Task updated successfully", data: updated });
  } catch {
    res.status(500).json({ success: false, message: "Internal server error", data: null });
  }
});

router.delete("/:id", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;

  try {
    const task = await prisma.task.findFirst({
      where: { id, userId: req.userId },
    });

    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    await prisma.task.delete({ where: { id } });
    res.status(200).json({ message: "Task deleted", data: null });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;// validation added
