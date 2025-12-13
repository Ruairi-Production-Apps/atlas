# Enhanced Form Builder Implementation Plan

## Overview
Expand the event form builder with advanced field types, validation, and conditional logic.

---

## Implementation Blocks

### **Block 1: Basic Input Fields (Priority: HIGH)**
Simple field types with built-in validation

**Field Types:**
- ✅ Email (with regex validation)
- ✅ Phone (with format validation - Irish/International)
- ✅ Number (with min/max/step options)
- ✅ Date (date picker)
- ✅ DateTime (date + time picker)

**Database Changes:**
- Add `validation_rules` JSONB column to `event_form_fields`
- Store validation config: { type: 'email'|'phone'|'number', min, max, step, format }

**UI Changes:**
- Add 5 new field type buttons
- Field config dialog: validation options per field type
- Frontend validation on submission

**Complexity**: Medium  
**Time**: 2-3 hours  
**Dependencies**: None

---

### **Block 2: File Upload Fields (Priority: HIGH)**
Allow file attachments in forms

**Field Types:**
- ✅ File Upload (single)
- ✅ File Upload (multiple)

**Database Changes:**
- Create `event_form_submissions_files` table
- Link to submission + field
- Store: file_url, file_name, file_size, mime_type

**Storage:**
- Use Supabase Storage bucket: `form-submissions`
- Set max file size per field (configurable)
- Allowed file types per field (configurable)

**UI Changes:**
- File upload component with drag-and-drop
- Progress indicator
- File list preview
- Delete uploaded files

**Complexity**: Medium-High  
**Time**: 3-4 hours  
**Dependencies**: Supabase Storage setup

---

### **Block 3: Checkboxes (Priority: MEDIUM)**
Already have multi_select, but add standalone checkbox

**Field Type:**
- ✅ Checkbox (single, for T&Cs, agreements, etc.)

**Database Changes:**
- No schema changes needed (reuse existing options field)

**UI Changes:**
- Single checkbox field type
- Option for custom text/label
- Required checkbox validation

**Complexity**: Low  
**Time**: 30 mins  
**Dependencies**: None

---

### **Block 4: Address Field (Priority: MEDIUM)**
Composite field with multiple sub-fields

**Field Type:**
- ✅ Address (composite)

**Sub-fields:**
- Address Line 1 (optional/required)
- Address Line 2 (optional/required)
- City (optional/required)
- County (dropdown of Irish counties) (optional/required)
- Eircode (optional/required)

**Database Changes:**
- Add `address_config` JSONB to `event_form_fields`
- Store: { fields: { address_1: { enabled, required }, ... } }
- Submission stores full address as JSON

**UI Changes:**
- Address field builder with toggles for each sub-field
- Address form component with Irish county dropdown
- Eircode format validation (optional)

**Complexity**: Medium  
**Time**: 2-3 hours  
**Dependencies**: None

---

### **Block 5: Content Fields (Priority: LOW)**
Non-input fields for structure and information

**Field Types:**
- ✅ Heading (H2, H3, H4 sizes)
- ✅ Paragraph Text (rich text or plain)
- ✅ Section Break (visual separator)
- ✅ Page Break (for multi-page forms - future)

**Database Changes:**
- Add `content` TEXT column for heading/paragraph text
- Add `style_config` JSONB for heading size, alignment, etc.

**UI Changes:**
- Content field editor with text input and styling
- Visual preview in form builder
- No submission data for these fields

**Complexity**: Low-Medium  
**Time**: 2 hours  
**Dependencies**: None

---

### **Block 6: Conditional Logic (Priority: HIGH - Complex)**
Show/hide fields based on other field values

**Features:**
- ✅ Show/hide individual fields
- ✅ Show/hide groups of fields
- ✅ Conditions: equals, not equals, contains, greater than, less than
- ✅ Multiple conditions with AND/OR logic

**Database Changes:**
- Add `conditional_logic` JSONB to `event_form_fields`
- Structure: 
  ```json
  {
    "enabled": true,
    "action": "show" | "hide",
    "logic": "all" | "any",
    "conditions": [
      {
        "field_id": "uuid",
        "operator": "equals" | "not_equals" | "contains" | "gt" | "lt",
        "value": "expected value"
      }
    ]
  }
  ```

**UI Changes:**
- Conditional logic builder in field config
- Field selector dropdown
- Operator selector
- Value input based on field type
- Live preview in form (show current visibility)

**Complexity**: High  
**Time**: 5-6 hours  
**Dependencies**: All other field types should be complete

---

## Implementation Order (Recommended)

### **Phase 1: Foundation** (Session 1)
1. Block 1: Basic Input Fields
2. Block 3: Checkboxes

**Deliverable**: Email, Phone, Number, Date, DateTime, Checkbox fields working

### **Phase 2: Advanced Fields** (Session 2)
3. Block 4: Address Field
4. Block 5: Content Fields

**Deliverable**: Address, Headings, Paragraphs, Section Breaks working

### **Phase 3: File Handling** (Session 3)
5. Block 2: File Upload Fields

**Deliverable**: File uploads working with storage

### **Phase 4: Intelligence** (Session 4)
6. Block 6: Conditional Logic

**Deliverable**: Full conditional logic system

---

## Database Schema Changes Summary

```sql
-- Add to event_form_fields table
ALTER TABLE event_form_fields 
  ADD COLUMN IF NOT EXISTS validation_rules JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS address_config JSONB,
  ADD COLUMN IF NOT EXISTS content TEXT,
  ADD COLUMN IF NOT EXISTS style_config JSONB,
  ADD COLUMN IF NOT EXISTS conditional_logic JSONB,
  ADD COLUMN IF NOT EXISTS file_config JSONB; -- max_size, allowed_types, multiple

-- New table for file uploads
CREATE TABLE event_form_submission_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES event_form_submissions(id) ON DELETE CASCADE,
  field_id UUID REFERENCES event_form_fields(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## New Field Types Summary

| Field Type | Priority | Complexity | Time Est. |
|------------|----------|------------|-----------|
| Email | HIGH | Low | 30m |
| Phone | HIGH | Low | 30m |
| Number | HIGH | Low | 30m |
| Date | HIGH | Low | 45m |
| DateTime | HIGH | Medium | 1h |
| Checkbox | MEDIUM | Low | 30m |
| File Upload | HIGH | Medium-High | 3-4h |
| Address | MEDIUM | Medium | 2-3h |
| Heading | LOW | Low | 45m |
| Paragraph | LOW | Low | 45m |
| Section Break | LOW | Low | 30m |
| Page Break | LOW | Low | 30m |
| Conditional Logic | HIGH | High | 5-6h |

**Total Estimated Time**: 16-22 hours across 4 sessions

---

## Questions to Clarify

1. **Phone validation**: Irish format only or international?
2. **File upload**: Max file sizes? Allowed file types (default)?
3. **Address**: Irish addresses only or international option?
4. **Rich text**: For paragraphs, basic formatting or full WYSIWYG?
5. **Page breaks**: Implement now or future feature?
6. **Conditional logic**: Limit complexity or allow nested conditions?

---

## Ready to Start?

I recommend we begin with **Phase 1** (Basic Input Fields + Checkboxes) as it:
- Provides immediate value
- Has no dependencies
- Establishes patterns for validation
- Can be completed in one session

Should I proceed with Phase 1?
