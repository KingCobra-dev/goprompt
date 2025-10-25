# 📖 New Utilities & Components - Quick Reference

## Overview

After the code cleanup, the following reusable utilities and components are now available:

---

## 📚 Utilities

### `string.ts` - String Utilities

**Location:** `src/lib/utils/string.ts`

#### getInitials()
```typescript
import { getInitials } from '../lib/utils/string'

// Convert names to initials
getInitials("John Doe")        // "JD"
getInitials("Alice")            // "AL"
getInitials("Mary Jane Watson")  // "MJ"
getInitials("")                  // ""

// Usage in components:
<div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
  {getInitials(user.name)}
</div>
```

---

### `date.ts` - Date Utilities

**Location:** `src/lib/utils/date.ts`

#### getRelativeTime()
```typescript
import { getRelativeTime } from '../lib/utils/date'

// Convert dates to relative time strings
getRelativeTime("2024-01-15T09:00:00Z")  // "Just now"    (if < 1 hour)
getRelativeTime("2024-01-15T07:00:00Z")  // "2h ago"      (< 24 hours)
getRelativeTime("2024-01-10T10:00:00Z")  // "5d ago"      (< 7 days)
getRelativeTime("2024-01-01T10:00:00Z")  // "2w ago"      (< 4 weeks)
getRelativeTime("2023-12-01T10:00:00Z")  // "2mo ago"     (> 4 weeks)

// Usage in components:
<span className="text-xs text-gray-500">
  {getRelativeTime(prompt.createdAt)}
</span>
```

---

## 🪝 Custom Hooks

### `usePromptActions()` - Prompt Interaction Hook

**Location:** `src/lib/hooks/usePromptActions.ts`

#### Features
- Manage heart (like) actions
- Manage save actions
- Animation state management
- Context integration
- User authentication check

#### Usage
```typescript
import { usePromptActions } from '../lib/hooks/usePromptActions'

export function MyComponent({ promptId }) {
  const {
    isHearted,
    isActuallySaved,
    handleHeart,
    handleSave,
    heartAnimating,
    saveAnimating
  } = usePromptActions(promptId)

  return (
    <div>
      <button
        onClick={handleHeart}
        className={isHearted ? 'text-red-500' : 'text-gray-500'}
      >
        {isHearted ? '❤️' : '🤍'} {isHearted ? 'Liked' : 'Like'}
      </button>

      <button
        onClick={handleSave}
        className={isActuallySaved ? 'text-blue-500' : 'text-gray-500'}
      >
        {isActuallySaved ? '⭐' : '☆'} {isActuallySaved ? 'Saved' : 'Save'}
      </button>
    </div>
  )
}
```

#### Return Values
```typescript
{
  isHearted: boolean,           // Whether current user has hearted the prompt
  isActuallySaved: boolean,     // Whether current user has saved the prompt
  handleHeart: () => void,      // Function to toggle heart status
  handleSave: () => void,       // Function to toggle save status
  heartAnimating: boolean,      // True during heart animation
  saveAnimating: boolean        // True during save animation
}
```

---

## 🧩 Components

### `CopyButton` - Copy to Clipboard Button

**Location:** `src/components/CopyButton.tsx`

#### Features
- Copy text to clipboard on click
- Visual feedback (CheckCircle icon on success)
- Customizable label, size, and variant
- Auto-reset after 2 seconds
- Accessible button component

#### Basic Usage
```typescript
import { CopyButton } from './CopyButton'

export function MyComponent() {
  return (
    <CopyButton
      text="Hello World"
      label="Copy"
    />
  )
}
```

#### Advanced Usage
```typescript
import { CopyButton } from './CopyButton'

export function CodeBlock({ code }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <pre>{code}</pre>
      <CopyButton
        text={code}
        label="Copy Code"
        size="sm"
        variant="outline"
      />
    </div>
  )
}
```

#### Props
```typescript
interface CopyButtonProps {
  text: string                    // Text to copy to clipboard
  label?: string                  // Button text (default: "Copy")
  size?: 'sm' | 'lg' | 'default'  // Button size (default: "sm")
  variant?: 'outline' | 'ghost' | 'default'  // Button style (default: "outline")
}
```

#### Variants
```typescript
// Outline style (default)
<CopyButton text="text" />

// Ghost style (minimal)
<CopyButton text="text" variant="ghost" />

// Default style (filled)
<CopyButton text="text" variant="default" />
```

#### Sizes
```typescript
// Small (default)
<CopyButton text="text" size="sm" />

// Default
<CopyButton text="text" size="default" />

// Large
<CopyButton text="text" size="lg" />
```

---

## 🔄 Migration Guide

### If You Had Duplicate Code Before

**Before (Duplicate):**
```typescript
// In ComponentA.tsx
function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// In ComponentB.tsx (SAME CODE)
function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
```

**After (Unified):**
```typescript
// In both ComponentA.tsx and ComponentB.tsx
import { getInitials } from '../lib/utils/string'
```

---

### Copy Button Migration

**Before (Duplicated):**
```typescript
const [copied, setCopied] = useState(false)

const handleCopy = () => {
  navigator.clipboard.writeText(text)
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
}

<Button onClick={handleCopy}>
  {copied ? <>
    <CheckCircle className="h-4 w-4 mr-2" />
    Copied!
  </> : <>
    <Copy className="h-4 w-4 mr-2" />
    Copy
  </>}
</Button>
```

**After (Using Component):**
```typescript
import { CopyButton } from './CopyButton'

<CopyButton text={text} label="Copy" />
```

---

## 💡 Best Practices

### 1. Use Utilities for Common Operations
```typescript
✅ DO:
import { getInitials, getRelativeTime } from '../lib/utils'

❌ DON'T:
function getInitials(name: string) { ... }
function getRelativeTime(date: string) { ... }
```

### 2. Use Custom Hooks for Complex Logic
```typescript
✅ DO:
const { isHearted, handleHeart } = usePromptActions(promptId)

❌ DON'T:
const [isHearted, setIsHearted] = useState(false)
// ... implement hearts logic here ...
```

### 3. Use Components for Reusable UI
```typescript
✅ DO:
<CopyButton text={code} />

❌ DON'T:
<Button onClick={() => {
  navigator.clipboard.writeText(code)
  setCopied(true)
  // ...
}}>
```

### 4. Import Paths
```typescript
// From src/components/
import { getInitials } from '../lib/utils/string'
import { usePromptActions } from '../lib/hooks/usePromptActions'
import { CopyButton } from './CopyButton'

// From src/lib/
import { getInitials } from './utils/string'
import { usePromptActions } from './hooks/usePromptActions'
```

---

## 🧪 Testing Utilities

### Testing getInitials()
```typescript
describe('getInitials', () => {
  it('should return initials from name', () => {
    expect(getInitials("John Doe")).toBe("JD")
  })

  it('should handle single names', () => {
    expect(getInitials("Alice")).toBe("AL")
  })

  it('should handle empty strings', () => {
    expect(getInitials("")).toBe("")
  })
})
```

### Testing getRelativeTime()
```typescript
describe('getRelativeTime', () => {
  it('should return "Just now" for recent dates', () => {
    const now = new Date()
    expect(getRelativeTime(now.toISOString())).toBe("Just now")
  })

  it('should return "Xh ago" for hours', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    expect(getRelativeTime(twoHoursAgo.toISOString())).toBe("2h ago")
  })
})
```

---

## 📦 What Was Removed

To understand why these utilities were created:

- **getInitials()** was duplicated in 2 files
- **getRelativeTime()** was duplicated in 2 files
- **Copy button logic** was repeated in multiple components
- **Heart/save logic** was duplicated across components

Now all of these have single implementations!

---

## 🔗 Related Files

- `src/lib/utils/string.ts` - String utilities
- `src/lib/utils/date.ts` - Date utilities
- `src/lib/hooks/usePromptActions.ts` - Custom hooks
- `src/components/CopyButton.tsx` - Reusable button component
- `src/components/PromptCard.tsx` - Updated to use new utilities

---

## ❓ FAQ

**Q: Can I still import from the old locations?**  
A: No, the old duplicate files have been deleted. Use the new centralized imports.

**Q: Do I need to update existing code?**  
A: Not immediately, but it's recommended to use the new utilities for new code.

**Q: What if the API changes?**  
A: Update in one place (the utility/hook), all components benefit!

**Q: Can I extend these utilities?**  
A: Yes! Add new functions to the utility files or create new hook files.

---

*Quick Reference Guide - October 25, 2025*