import request from "supertest";
import app from "../app";
import prisma from "../lib/prisma";
import dotenv from "dotenv";

dotenv.config();

beforeAll(async () => {
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

const testUser = {
  name: "Test User",
  email: "test@gmail.com",
  password: "Test123$$",
};

let authToken: string;
let taskId: string;

// ===========================
// TC-TODO-001: USER REGISTER
// ===========================
describe("TC-TODO-001 — User Registration", () => {
  it("should register a new user and return JWT token", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.password).toBeUndefined();
  });
});

// ===========================
// TC-TODO-002: USER LOGIN
// ===========================
describe("TC-TODO-002 — User Login", () => {
  it("should login and return JWT token", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);

    authToken = res.body.token;
  });
});

// ===========================
// TC-TODO-003: GET TASKS
// ===========================
describe("TC-TODO-003 — Get Tasks", () => {
  it("should return task list for authenticated user", async () => {
    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ===========================
// TC-TODO-004: CREATE TASK
// ===========================
describe("TC-TODO-004 — Create Task", () => {
  it("should create a new task for authenticated user", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Learn GoLang" });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe("Learn GoLang");
    expect(res.body.data.isDone).toBe(false);

    taskId = res.body.data.id;
  });
});

// ===========================
// TC-TODO-005: UPDATE TASK
// ===========================
describe("TC-TODO-005 — Update Task", () => {
  it("should update task isDone status", async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ isDone: true });

    expect(res.status).toBe(200);
    expect(res.body.data.isDone).toBe(true);
  });
});

// ===========================
// TC-TODO-006: DELETE TASK
// ===========================
describe("TC-TODO-006 — Delete Task", () => {
  it("should delete task successfully", async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeNull();
  });
});