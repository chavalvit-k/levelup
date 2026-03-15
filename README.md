# LevelUp

**Turn your tasks into levels.**

LevelUp is a personal **gamified productivity web application** that turns daily tasks into a progression system.  
Complete tasks, earn XP, level up, unlock character cosmetics, and maintain streaks.

The goal of LevelUp is to make productivity feel like a game while maintaining a **modern minimal interface**.

---

# Product Vision

LevelUp transforms everyday productivity into a progression loop:


Plan tasks
→ Complete tasks
→ Earn XP
→ Level up
→ Unlock rewards
→ Maintain streaks
→ Repeat


The system encourages consistency, focus, and task completion while providing satisfying progress feedback.

---

# Visual Identity

## Tagline

**Turn your tasks into levels.**

---

## Logo Concept

Simple and minimal logo that represents **progress and leveling up**.

Suggested concept:

- **Pixel-style upward arrow**
- Combined with a **progress bar**
- Represents growth and progression

Example concept:


▰▰▰▰▰
↑
LevelUp


Design principles:

- minimal
- geometric
- scalable
- works in monochrome or color

---

# Art Direction

The application combines:

- **Modern SaaS UI**
- **Pixel-art character progression**

Design inspiration:

- Linear
- Vercel
- Raycast

Goals:

- modern
- minimal
- clean
- rewarding interactions
- game-like progression without visual clutter

---

# Color Palette

Primary UI palette:

| Usage | Color |
|------|------|
| Primary | #6366F1 |
| XP / Rewards | #F59E0B |
| Success | #22C55E |
| Failure | #EF4444 |
| Streak | #FB923C |

Base UI colors:

| Usage | Color |
|------|------|
| Background | #0F172A |
| Card Background | #111827 |
| Border | #1F2937 |
| Text | #E5E7EB |

---

# UI Style

The interface must be:

- modern
- minimal
- clean
- desktop-first

Key UI elements:

- animated XP progress bars
- clear task state colors
- character preview panel
- smooth micro-interactions
- uncluttered layout

---

# Gamification Elements

LevelUp includes several game-like mechanics:

- XP rewards
- level progression
- character cosmetics
- streak rewards
- milestone rewards
- hero task bonus
- daily completion bonus

---

# Character System

LevelUp features a **pixel-art character** representing the user's progress.

Character progression reflects level and achievements.

Equipment slots:

- hat
- glasses
- shirt
- pants
- shoes

At **Level 0**, the user can only customize:


character color


Using a color picker.

Cosmetics unlock as the user levels up.

---

# Daily To-Do List

This is the **core gameplay system**.

Daily tasks represent tasks the user intends to complete on a specific day.

Users can create tasks for:

- today
- future dates

Each task must include:

- title
- assigned date
- difficulty
- task type
- optional subtasks
- optional required duration

---

# Task Status

Each task can have one of the following statuses:

| Status | Description |
|------|------|
| pending | task created but not completed |
| done | task completed |
| failed | task not completed before midnight |

Visual behavior:

Done tasks:

- green color
- strike-through text

Failed tasks:

- red color
- automatically applied after midnight

Users must clear the previous day's tasks before creating tasks for the next day.

---

# Subtasks

Tasks may contain subtasks with **one level only**.

Example:


Task A
├─ Subtask A1
├─ Subtask A2
└─ Subtask A3


Rules:

- only one subtask level allowed
- subtasks cannot contain further subtasks
- subtasks do not grant XP
- XP is awarded when the **main task is completed**

---

# Difficulty Levels

Difficulty applies **only to main tasks**.

Subtasks cannot have difficulty levels.

| Difficulty | XP Reward |
|------|------|
| Trivial | 5 XP |
| Standard | 10 XP |
| Challenging | 15 XP |
| Heroic | 20 XP |

---

# Task Types

Tasks can be either **Timed** or **Non-Timed**.

## Timed Tasks

Tasks that require a specific amount of time to complete.

Examples:

- Study – 4 hours
- Workout – 1 hour

Timed tasks include:


required_duration


Timed tasks can be completed by:

- timer completion
- manual completion

---

## Non-Timed Tasks

Tasks without required duration.

Examples:

- Buy vegetables
- Reply emails

Completion method:

- manual check only

---

# Timer System

The application includes a **Timer page**.

The timer supports two modes.

## Task Timer

User selects a task before starting the timer.

Features:

- tracks elapsed time
- continues running after required duration is reached
- task automatically marked as done when required time is reached
- timer continues until stopped manually

---

## Free Timer

Timer runs without selecting a task.

Used as a general productivity timer.

Does not affect task completion.

---

# Hero Task

Each daily list can include **one Hero Task**.

Rules:

- only one per day
- difficulty must be **Standard or higher**
- completing the Hero Task grants:


+10 XP bonus


---

# Daily Completion Bonus

If the user completes **all tasks in that day**, they receive:


+20% bonus XP


based on the total XP earned that day.

---

# General Task List

Separate from Daily To-Do.

Used as a **general task notebook**.

Characteristics:

| Feature | Value |
|------|------|
| XP reward | none |
| Subtasks | none |
| Difficulty | none |
| Priority | yes |
| Deadline | optional |

Priority levels:


low
medium
high
urgent


---

# Level System

XP is earned through **Daily Tasks only**.

XP required per level:


500 XP


Maximum level (current version):


Level 30


Future updates may extend the level cap.

---

# Reward System

Two types of rewards exist.

---

# Streak Rewards

A streak counts the number of **consecutive days where all daily tasks are completed**.

Every **10 streaks**, the user can assign a reward.

Example:


10 streak → eat favorite dessert
20 streak → watch a movie
30 streak → take a break day


---

# Level Milestone Rewards

Rewards gained from leveling up.

## Every Level

User receives **one cosmetic item**.

Cosmetics cycle through:


hat → glasses → shirt → pants → shoes


Each cosmetic supports **color customization via color picker**.

---

## Every 5 Levels

User receives an additional **custom reward slot** similar to streak rewards.

Example milestones:


Level 5
Level 10
Level 15
Level 20
Level 25
Level 30


---

# Dashboard

The dashboard provides an overview of user progress.

Suggested elements:

- today's tasks
- hero task highlight
- XP earned today
- level progress bar
- current streak
- character preview
- timer usage
- recent rewards
- upcoming tasks

---

# Design Principles

LevelUp should always prioritize:

- clarity
- focus
- minimalism
- rewarding interactions
- visual simplicity
