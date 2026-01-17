# Personal Knowledge Engine - Feedback Layer Design

## How PKE Interacts with Users

The PKE surfaces insights in **4 ways**:

### 1. **Dashboard Insights Widget** (Primary)
- **Location**: Top of Dashboard, below greeting
- **Shows**: 1-3 most relevant insights
- **Frequency**: Updates daily
- **Examples**:
  - "You tend to feel more focused after morning routines. Maybe that's your anchor habit?"
  - "You've made the most progress when you write before you plan. Want to make that your default workflow?"
  - "I noticed you've felt overwhelmed 3 times this week. Want to explore what's behind it?"

### 2. **Contextual Insights** (Secondary)
- **Location**: Within specific features
- **Projects Page**: "You complete tasks faster when you break them into smaller pieces"
- **Money Hub**: "You tend to spend more on days you feel drained. Want to talk about that pattern?"
- **Calendar**: "You schedule better when you plan the week on Sundays"

### 3. **Weekly Reflection** (Scheduled)
- **Location**: Dashboard, appears on Sundays
- **Shows**: Weekly pattern summary
- **Example**: "This week you felt most productive on Tuesday and Thursday. Both days you started with planning. Maybe that's your pattern?"

### 4. **Gentle Reminders** (Subtle)
- **Location**: Throughout the app
- **Shows**: Micro-feedback based on current activity
- **Example**: When user logs expense → "You've logged expenses 5 days in a row. That's consistency!"

---

## Implementation Flow

```
User Activity
    ↓
Knowledge Event Created
    ↓
Embedding Generated (background job)
    ↓
Pattern Detection (nightly job)
    ↓
Insight Generation (nightly job)
    ↓
Insight Stored in knowledge_insights table
    ↓
Frontend Fetches Insights
    ↓
Displayed in UI
```

---

## Insight Types

1. **Pattern Detection**: "You often feel X after Y"
2. **Productivity Patterns**: "You work best when..."
3. **Emotional Patterns**: "You tend to feel overwhelmed when..."
4. **Spending Patterns**: "You spend more when..."
5. **Habit Suggestions**: "Maybe try..."

---

## Tone & Language

- **Human, not robotic**
- **Gentle, not judgmental**
- **Suggestive, not prescriptive**
- **Curious, not analytical**

Example:
- ❌ "Your productivity decreased 23% this week"
- ✅ "I noticed you felt more scattered this week. Want to explore what changed?"






