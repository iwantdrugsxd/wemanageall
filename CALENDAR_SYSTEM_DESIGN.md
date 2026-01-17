# 📅 Calendar System - Complete Design & Implementation

## 🎯 UX Flow - End-to-End User Journey

### Primary Flows

#### 1. **Quick Add Event**
```
User clicks time slot
  ↓
Quick add modal appears (pre-filled with time)
  ↓
User types title (optional: description, color)
  ↓
Clicks "Add" or presses Enter
  ↓
Event appears on calendar instantly
  ↓
User can drag to adjust time
```

#### 2. **Drag & Resize Planning**
```
User sees empty time slot
  ↓
Clicks and drags to create time block
  ↓
Block appears with default 1-hour duration
  ↓
User drags bottom edge to resize
  ↓
User types title directly on block
  ↓
Auto-saves after 2 seconds of inactivity
```

#### 3. **Edit Existing Event**
```
User clicks existing event
  ↓
Event details panel slides in from right
  ↓
User edits title, time, description, color
  ↓
Changes save automatically
  ↓
User can drag event to new time slot
```

#### 4. **View Switching**
```
User clicks Day/Week/Month toggle
  ↓
Calendar smoothly transitions
  ↓
Events reflow to fit new view
  ↓
Current date highlighted
```

---

## 🎨 UI Layout

### Main Calendar Screen

```
┌─────────────────────────────────────────────────────────┐
│  [←]  January 2024  [Today]  [→]    [Day|Week|Month]   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Time │ Mon 15 │ Tue 16 │ Wed 17 │ ... │ Sun 21        │
│  ─────┼────────┼────────┼────────┼─────┼────────        │
│  8:00 │        │ [Event]│        │     │               │
│  9:00 │        │        │        │     │               │
│ 10:00 │[Task]  │        │[Note]  │     │               │
│ 11:00 │        │        │        │     │               │
│  ...  │        │        │        │     │               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Components

1. **Header Bar**
   - Navigation arrows (prev/next)
   - Current date range display
   - "Today" button
   - View toggle (Day/Week/Month)

2. **Calendar Grid**
   - Time column (left)
   - Day columns (right)
   - Clickable time slots
   - Event blocks (draggable, resizable)

3. **Event Block**
   - Title (editable inline)
   - Color indicator (left border)
   - Time range display
   - Hover: edit/delete buttons

4. **Event Details Panel** (slides in from right)
   - Title input
   - Date/time pickers
   - Description textarea
   - Color picker
   - Delete button

5. **Quick Add Modal** (centered overlay)
   - Title input (autofocus)
   - Time pre-filled
   - Quick color selection
   - "Add" button

---

## 🏗️ Frontend Architecture

### Component Structure

```
Calendar.jsx (Main Container)
├── CalendarHeader.jsx
│   ├── ViewToggle.jsx
│   └── DateNavigation.jsx
├── CalendarGrid.jsx
│   ├── TimeColumn.jsx
│   ├── DayColumn.jsx
│   │   └── TimeSlot.jsx
│   └── EventBlock.jsx (draggable)
├── EventDetailsPanel.jsx
├── QuickAddModal.jsx
└── CalendarLegend.jsx
```

### State Management

```javascript
// Main state in Calendar.jsx
const [events, setEvents] = useState([]);
const [view, setView] = useState('week'); // 'day' | 'week' | 'month'
const [currentDate, setCurrentDate] = useState(new Date());
const [selectedEvent, setSelectedEvent] = useState(null);
const [draggedEvent, setDraggedEvent] = useState(null);
const [quickAddSlot, setQuickAddSlot] = useState(null);
```

### Key Libraries Needed

- `react-dnd` or `@dnd-kit/core` - Drag and drop
- `date-fns` - Date manipulation
- `react-datepicker` - Date/time pickers

---

## 🗄️ Backend Design

### Database Schema

```sql
-- Calendar Events Table
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Core fields
    title VARCHAR(500) NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'event', -- 'event', 'task', 'note', 'reminder'
    
    -- Time fields
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    all_day BOOLEAN DEFAULT FALSE,
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Styling
    color VARCHAR(7) DEFAULT '#3B6E5C', -- Hex color
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Indexes
CREATE INDEX idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX idx_calendar_events_date_range ON calendar_events(user_id, start_time, end_time);
CREATE INDEX idx_calendar_events_type ON calendar_events(type);
```

### API Routes

```
GET    /api/calendar/events
  Query params: start_date, end_date, type
  Returns: Array of events in date range

POST   /api/calendar/events
  Body: { title, description, start_time, end_time, type, color, all_day }
  Returns: Created event

GET    /api/calendar/events/:id
  Returns: Single event

PATCH  /api/calendar/events/:id
  Body: { title, description, start_time, end_time, type, color, all_day }
  Returns: Updated event

DELETE /api/calendar/events/:id
  Returns: { success: true }

PATCH  /api/calendar/events/:id/move
  Body: { start_time, end_time }
  Returns: Updated event (for drag operations)
```

---

## 🔄 Integration Flow

### Creating an Event

```
1. User clicks time slot
   ↓
2. Frontend: setQuickAddSlot({ date, time })
   ↓
3. QuickAddModal opens with pre-filled time
   ↓
4. User enters title, clicks "Add"
   ↓
5. Frontend: POST /api/calendar/events
   Body: { title, start_time, end_time, type: 'event' }
   ↓
6. Backend: Validate, insert into database
   ↓
7. Backend: Return created event
   ↓
8. Frontend: Add event to local state
   ↓
9. Event appears on calendar
```

### Dragging an Event

```
1. User drags event block
   ↓
2. Frontend: Calculate new start_time, end_time
   ↓
3. Frontend: Optimistically update UI
   ↓
4. Frontend: PATCH /api/calendar/events/:id/move
   Body: { start_time, end_time }
   ↓
5. Backend: Validate time range, check conflicts
   ↓
6. Backend: Update database
   ↓
7. Backend: Return updated event
   ↓
8. Frontend: Update local state (if different from optimistic)
```

### Resizing an Event

```
1. User drags bottom edge of event
   ↓
2. Frontend: Calculate new end_time
   ↓
3. Frontend: Update event block height
   ↓
4. On mouse release: PATCH /api/calendar/events/:id
   Body: { end_time }
   ↓
5. Backend: Validate, update
   ↓
6. Frontend: Sync with server response
```

---

## ⚠️ Edge Cases

### 1. Overlapping Events

**Problem**: Two events scheduled at the same time

**Solution**:
- Visual: Stack events side-by-side (width: 50% each)
- Backend: Allow overlaps (user's choice)
- Warning: Show subtle indicator if overlap detected
- Option: "Auto-adjust" button to suggest new time

### 2. Timezones

**Problem**: User travels or changes timezone

**Solution**:
- Store all times in UTC in database
- Store user's timezone preference
- Convert on frontend for display
- When user changes timezone, recalculate all displayed times

### 3. Editing Conflicts

**Problem**: User edits event while another device also edits

**Solution**:
- Optimistic updates on frontend
- Backend returns latest version
- If conflict: Show "This was updated elsewhere" message
- Option to merge or overwrite

### 4. Very Long Events

**Problem**: Event spans multiple days/weeks

**Solution**:
- Show event block on first day
- Add indicator "→ continues" on subsequent days
- In month view: Show as thin bar across days

### 5. All-Day Events

**Problem**: Events without specific time

**Solution**:
- Store with start_time = 00:00, end_time = 23:59
- Display in special "All Day" row at top
- Don't show in time slots

### 6. Past Events

**Problem**: Events in the past

**Solution**:
- Show with reduced opacity (50%)
- Option to filter: "Show past events"
- Different styling (grayed out)

---

## 🎨 Visual Design Principles

### Colors
- **Events**: Soft green (#3B6E5C)
- **Tasks**: Soft blue (#4A90E2)
- **Notes**: Soft yellow (#F5A623)
- **Reminders**: Soft orange (#FF6B6B)

### Typography
- **Event titles**: 14px, medium weight
- **Time labels**: 12px, regular
- **Descriptions**: 13px, regular, muted

### Spacing
- **Time slot height**: 60px (1 hour = 60px)
- **Event padding**: 4px vertical, 8px horizontal
- **Grid gaps**: 1px borders

### Interactions
- **Hover**: Subtle background change
- **Drag**: Semi-transparent preview
- **Click**: Smooth panel slide-in
- **Save**: Subtle fade-in animation

---

## 🚀 Implementation Priority

### Phase 1: Core Functionality
1. Database schema
2. Basic API routes (CRUD)
3. Calendar grid rendering
4. Click to add event
5. Display events on calendar

### Phase 2: Interactions
1. Drag to move events
2. Resize events
3. Edit event details
4. Delete events

### Phase 3: Polish
1. View switching (Day/Week/Month)
2. Color customization
3. Event types (task/note/reminder)
4. Conflict detection

### Phase 4: Advanced
1. Recurring events
2. Event reminders
3. Calendar sharing (future)
4. Mobile optimization









