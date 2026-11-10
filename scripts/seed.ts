import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import env from "../src/config/env";
import Comment from "../src/models/comment.model";
import Task from "../src/models/task.model";
import Project from "../src/models/project.model";
import Workspace, { WorkspaceMember } from "../src/models/workspace.model";
import User from "../src/models/user.model";

async function main() {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // -----------------------------------------------------------------------
      // Clear existing seed data
      // -----------------------------------------------------------------------

      await Comment.deleteMany({}).session(session);
      await Task.deleteMany({}).session(session);
      await Project.deleteMany({}).session(session);
      await WorkspaceMember.deleteMany({}).session(session);
      await Workspace.deleteMany({}).session(session);
      await User.deleteMany({}).session(session);

      // -----------------------------------------------------------------------
      // Password
      // -----------------------------------------------------------------------

      const hashedPassword = await bcrypt.hash(env.seedPassword, 10);

      // -----------------------------------------------------------------------
      // Users
      // -----------------------------------------------------------------------

      const users = await User.create(
        [
          {
            name: "Ali Jawad",
            email: "aaa@aaa.com",
            password: hashedPassword,
          },
          {
            name: "User 2",
            email: "aaa@bbb.com",
            password: hashedPassword,
          },
          {
            name: "User 3",
            email: "aaa@ccc.com",
            password: hashedPassword,
          },
        ],
        { session },
      );

      const [user1, user2, user3] = users;

      // -----------------------------------------------------------------------
      // Workspaces
      // -----------------------------------------------------------------------

      const workspaces = await Workspace.create(
        [
          {
            name: "Main Workspace",
            owner: user1._id,
          },
          {
            name: "Secondary Workspace",
            owner: user2._id,
          },
        ],
        { session },
      );

      const [workspace1, workspace2] = workspaces;

      // -----------------------------------------------------------------------
      // Workspace Members
      // -----------------------------------------------------------------------

      await WorkspaceMember.insertMany(
        [
          {
            user: user1._id,
            workspace: workspace1._id,
            role: "OWNER",
          },
          {
            user: user2._id,
            workspace: workspace1._id,
            role: "ADMIN",
          },
          {
            user: user3._id,
            workspace: workspace1._id,
            role: "MEMBER",
          },
          {
            user: user1._id,
            workspace: workspace2._id,
            role: "ADMIN",
          },
          {
            user: user2._id,
            workspace: workspace2._id,
            role: "OWNER",
          },
          {
            user: user3._id,
            workspace: workspace2._id,
            role: "MEMBER",
          },
        ],
        { session },
      );

      // -----------------------------------------------------------------------
      // Projects
      // -----------------------------------------------------------------------

      const projects = await Project.insertMany(
        [
          {
            name: "Main Project",
            shortKey: "MP",
            workspaceId: workspace1._id,
          },
          {
            name: "Secondary Project",
            shortKey: "SP",
            workspaceId: workspace1._id,
          },
          {
            name: "Workspace 2 Project",
            shortKey: "W2P",
            workspaceId: workspace2._id,
          },
        ],
        { session },
      );

      const [project1] = projects;

      // -----------------------------------------------------------------------
      // Tasks
      // -----------------------------------------------------------------------

      const tasks = await Task.insertMany(
        [
          {
            title: "Main Task",
            reporterId: user1._id,
            projectId: project1._id,
          },
          {
            title: "Build authentication",
            reporterId: user1._id,
            assigneeId: user2._id,
            projectId: project1._id,
            status: "IN_PROGRESS",
            priority: "HIGH",
          },
          {
            title: "Create dashboard",
            reporterId: user1._id,
            assigneeId: user3._id,
            projectId: project1._id,
          },
          {
            title: "Add task filtering",
            reporterId: user2._id,
            assigneeId: user1._id,
            projectId: project1._id,
            priority: "LOW",
          },
          {
            title: "Implement pagination",
            reporterId: user2._id,
            assigneeId: user3._id,
            projectId: project1._id,
            status: "IN_PROGRESS",
            priority: "HIGH",
          },
          {
            title: "Add search functionality",
            reporterId: user3._id,
            assigneeId: user2._id,
            projectId: project1._id,
            status: "DONE",
          },
          {
            title: "Validate task input",
            reporterId: user1._id,
            assigneeId: user2._id,
            projectId: project1._id,
            status: "DONE",
            priority: "HIGH",
          },
          {
            title: "Handle task permissions",
            reporterId: user3._id,
            projectId: project1._id,
            priority: "HIGH",
          },
          {
            title: "Improve error handling",
            reporterId: user2._id,
            assigneeId: user1._id,
            projectId: project1._id,
            status: "IN_PROGRESS",
            priority: "LOW",
          },
          {
            title: "Add sorting",
            reporterId: user1._id,
            assigneeId: user3._id,
            projectId: project1._id,
          },
          {
            title: "Write API documentation",
            reporterId: user3._id,
            assigneeId: user1._id,
            projectId: project1._id,
            status: "TODO",
            priority: "LOW",
          },
        ],
        { session },
      );

      const [task1] = tasks;

      // -----------------------------------------------------------------------
      // Comments
      // -----------------------------------------------------------------------

      await Comment.create(
        [
          {
            comment: "Some comment",
            task: task1._id,
            author: user1._id,
          },
          {
            comment: "I'll start working on this.",
            task: task1._id,
            author: user2._id,
          },
          {
            comment: "The requirements look clear.",
            task: task1._id,
            author: user3._id,
          },
          {
            comment: "I've completed the initial implementation.",
            task: task1._id,
            author: user2._id,
          },
          {
            comment: "Please review the latest changes.",
            task: task1._id,
            author: user1._id,
          },
          {
            comment: "Found a small issue that needs to be fixed.",
            task: task1._id,
            author: user3._id,
          },
        ],
        { session },
      );
    });

    console.log("Seed completed successfully.");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await session.endSession();
    await mongoose.disconnect();
  }
}

mongoose
  .connect(process.env.MONGODB_URI!)
  .then(main)
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exitCode = 1;
  });
