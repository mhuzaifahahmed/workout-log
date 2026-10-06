// Source of truth: Personalized_Training_Program.pdf
// Edit this file if the program changes — everything else reads from here.

const PLAN = {
  "Push A": {
    subtitle: "Chest Priority",
    exercises: [
      { name: "Barbell Bench Press", sets: 4, repTarget: "6-8", note: "Chest (primary), triceps/front delt" },
      { name: "Incline DB Press", sets: 3, repTarget: "8-10", note: "Upper chest" },
      { name: "Cable Fly", sets: 3, repTarget: "12-15", note: "Chest (stretch/contraction)" },
      { name: "Lateral Raise", sets: 2, repTarget: "15-20", note: "Side delt" },
      { name: "Seated DB Overhead Triceps Extension", sets: 2, repTarget: "10-12", note: "Triceps (long head)" },
    ],
  },
  "Pull A": {
    subtitle: "Back Priority",
    exercises: [
      { name: "Pull-up → Lat Pulldown", sets: 4, repTarget: "6-10", note: "Pull-ups to fatigue, finish remaining sets on pulldown" },
      { name: "Chest-Supported Row", sets: 4, repTarget: "8-10", note: "Back thickness" },
      { name: "Lat Pullover (cable rope)", sets: 3, repTarget: "12", note: "Lats — top stretch, bottom squeeze" },
      { name: "Preacher Curl", sets: 2, repTarget: "10-12", note: "Biceps (short head)" },
    ],
  },
  "Legs": {
    subtitle: "",
    exercises: [
      { name: "Squat or Leg Press", sets: 3, repTarget: "6-10", note: "Quads/glutes" },
      { name: "Romanian Deadlift", sets: 3, repTarget: "8-10", note: "Hamstrings/glutes" },
      { name: "Leg Extension", sets: 2, repTarget: "12-15", note: "Quads isolation" },
      { name: "Leg Curl", sets: 2, repTarget: "12-15", note: "Hamstrings isolation" },
      { name: "Calf Raise", sets: 3, repTarget: "12-15", note: "Calves" },
    ],
  },
  "Abs+Forearms": {
    subtitle: "",
    exercises: [
      { name: "Cable Crunch", sets: 3, repTarget: "12-15", note: "Abs (upper)" },
      { name: "Hanging Knee Raise", sets: 3, repTarget: "12-15", note: "Abs (lower)" },
      { name: "Russian Twist (5kg plate)", sets: 3, repTarget: "per side", note: "Obliques" },
      { name: "Wrist Curl (flexion)", sets: 3, repTarget: "15-20", note: "Forearm flexors" },
      { name: "Reverse EZ-Bar Curl", sets: 3, repTarget: "10-12", note: "Forearm extensors/brachioradialis" },
    ],
  },
  "Push B": {
    subtitle: "Shoulders Priority + Chest Secondary",
    exercises: [
      { name: "Seated DB Shoulder Press", sets: 3, repTarget: "8-10", note: "Front/side delt" },
      { name: "Flat or Incline DB Press", sets: 3, repTarget: "8-10", note: "Chest — different angle from Day 1" },
      { name: "Lateral Raise", sets: 3, repTarget: "15-20", note: "Side delt" },
      { name: "Rear Delt Fly", sets: 3, repTarget: "15-20", note: "Rear delt" },
      { name: "Triceps Pushdown", sets: 2, repTarget: "10-12", note: "Triceps (top-up)" },
      { name: "Shrugs", sets: 3, repTarget: "12-15", note: "Traps" },
    ],
  },
  "Pull B": {
    subtitle: "Back Secondary + Bicep Focus",
    exercises: [
      { name: "Single-Arm DB Row / Close-Grip Cable Row", sets: 3, repTarget: "8-10", note: "Mid-back thickness" },
      { name: "Lat Pulldown (different grip)", sets: 3, repTarget: "8-10", note: "Lats" },
      { name: "Cross-Body Hammer Curl (one arm at a time)", sets: 3, repTarget: "10-12", note: "Brachialis/brachioradialis" },
      { name: "Incline DB Curl", sets: 2, repTarget: "10-12", note: "Biceps (long head, stretch-biased)" },
    ],
  },
};

const DAY_ORDER = ["Push A", "Pull A", "Legs", "Abs+Forearms", "Push B", "Pull B"];
