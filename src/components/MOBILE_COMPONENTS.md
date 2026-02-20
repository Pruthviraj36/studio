# Mobile Responsiveness Implementation Guide

This guide explains how to use the mobile responsiveness utilities and components to optimize your app for all screen sizes.

## 1. Responsive Utilities (`lib/responsive.ts`)

### Media Query Hooks

#### `useMediaQuery(breakpoint)`
Check if current viewport width is greater than or equal to a breakpoint.

```typescript
import { useMediaQuery } from '@/lib/responsive';

export function MyComponent() {
  const isLargeScreen = useMediaQuery(1024);
  
  if (isLargeScreen) {
    // Show large screen version
  }
}
```

#### Device Detection Hooks
Quick shortcuts for common breakpoints:

```typescript
import { useIsMobile, useIsTablet, useIsDesktop } from '@/lib/responsive';

export function MyComponent() {
  const isMobile = useIsMobile();    // < 768px
  const isTablet = useIsTablet();    // >= 768px, < 1024px
  const isDesktop = useIsDesktop();  // >= 1024px
  
  return (
    <div>
      {isMobile && <MobileView />}
      {isTablet && <TabletView />}
      {isDesktop && <DesktopView />}
    </div>
  );
}
```

#### `useScreenWidth()`
Get the current screen width in pixels.

```typescript
const width = useScreenWidth();
console.log(`Current width: ${width}px`);
```

#### `useOrientation()`
Detect portrait or landscape orientation.

```typescript
const orientation = useOrientation(); // 'portrait' | 'landscape'
```

#### `useIsTouchDevice()`
Check if device supports touch.

```typescript
const isTouchDevice = useIsTouchDevice();
if (isTouchDevice) {
  // Show touch-friendly UI
}
```

### Responsive Utility Functions

#### `getResponsiveSpacing(baseSize)`
Get responsive padding/margin values.

```typescript
import { getResponsiveSpacing } from '@/lib/responsive';

const padding = getResponsiveSpacing(4); // Returns: "px-4 md:px-6 lg:px-8"

export function MyComponent() {
  return <div className={`p-4 ${padding}`}>Content</div>;
}
```

#### `getResponsiveFontSize(baseSize)`
Get responsive font sizes.

```typescript
import { getResponsiveFontSize } from '@/lib/responsive';

export function MyComponent() {
  return <h1 className={getResponsiveFontSize('lg')}>Title</h1>;
  // Output: "text-lg md:text-xl lg:text-2xl"
}
```

#### `getResponsiveColumns(cols)`
Get responsive grid column classes.

```typescript
import { getResponsiveColumns } from '@/lib/responsive';

export function MyComponent() {
  return (
    <div className={`grid gap-4 ${getResponsiveColumns(3)}`}>
      {/* Responsive grid with 1 col on mobile, 2 on tablet, 3 on desktop */}
    </div>
  );
}
```

## 2. Layout Components (`components/mobile-optimized-layout.tsx`)

### `MobileOptimizedLayout`
Main layout wrapper that adapts based on screen size.

```typescript
import { MobileOptimizedLayout } from '@/components/mobile-optimized-layout';

export function Page() {
  return (
    <MobileOptimizedLayout
      sidebar={<Sidebar />}
      sidebarPosition="left"
      showSidebarOnMobile={false}
    >
      <MainContent />
    </MobileOptimizedLayout>
  );
}
```

**Props:**
- `children`: Main content
- `sidebar`: Optional sidebar content
- `sidebarPosition`: 'left' or 'right' (default: 'left')
- `showSidebarOnMobile`: Show sidebar on mobile (default: false)
- `className`: Additional classes

### `ResponsiveGrid`
Automatically responsive grid with configurable columns per breakpoint.

```typescript
import { ResponsiveGrid } from '@/components/mobile-optimized-layout';

export function CardGrid() {
  return (
    <ResponsiveGrid
      mobileColumns={1}
      tabletColumns={2}
      desktopColumns={3}
      gap="gap-4"
    >
      <Card>Item 1</Card>
      <Card>Item 2</Card>
      <Card>Item 3</Card>
    </ResponsiveGrid>
  );
}
```

### `ResponsiveContainer`
Wrapper with responsive max-width and padding.

```typescript
import { ResponsiveContainer } from '@/components/mobile-optimized-layout';

export function Page() {
  return (
    <ResponsiveContainer maxWidth="lg" padding="px-4 md:px-6 lg:px-8">
      <MainContent />
    </ResponsiveContainer>
  );
}
```

### `TouchFriendlyButton`
Button with 48px minimum hit area (mobile best practice).

```typescript
import { TouchFriendlyButton } from '@/components/mobile-optimized-layout';

<TouchFriendlyButton onClick={handleClick}>
  Click me
</TouchFriendlyButton>
```

### `ResponsiveText`
Text component that changes size based on viewport.

```typescript
import { ResponsiveText } from '@/components/mobile-optimized-layout';

<ResponsiveText
  mobileSize="text-sm"
  tabletSize="md:text-base"
  desktopSize="lg:text-lg"
>
  Dynamic text
</ResponsiveText>
```

## 3. Navigation Components (`components/mobile-navigation.tsx`)

### `MobileNavigation`
Hamburger menu for mobile screens.

```typescript
import { MobileNavigation } from '@/components/mobile-navigation';
import { Home, User, Settings } from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/', icon: <Home /> },
  { label: 'Profile', href: '/profile', icon: <User /> },
  { label: 'Settings', href: '/settings', icon: <Settings /> },
];

export function Header() {
  return (
    <header className="flex items-center justify-between">
      <Logo />
      <MobileNavigation items={navItems} />
    </header>
  );
}
```

### `MobileBottomNav`
Tab bar at bottom of screen (iOS/Android style).

```typescript
import { MobileBottomNav } from '@/components/mobile-navigation';
import { Home, Search, Plus, Heart, User } from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/', icon: <Home />, active: true },
  { label: 'Search', href: '/search', icon: <Search /> },
  { label: 'Create', href: '/create', icon: <Plus /> },
  { label: 'Likes', href: '/likes', icon: <Heart /> },
  { label: 'Profile', href: '/profile', icon: <User /> },
];

export function App() {
  return (
    <>
      <MainContent />
      <MobileBottomNav items={navItems} />
    </>
  );
}
```

### `MobileDrawer`
Collapsible sidebar drawer.

```typescript
import { MobileDrawer } from '@/components/mobile-navigation';
import { useState } from 'react';

export function Page() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Menu</button>
      <MobileDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        position="left"
        title="Menu"
      >
        <nav className="space-y-2 p-4">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/profile">Profile</NavLink>
        </nav>
      </MobileDrawer>
    </>
  );
}
```

## 4. Form Components (`components/mobile-form-optimized.tsx`)

### `MobileForm`
Form wrapper with mobile-optimized spacing.

```typescript
import { MobileForm } from '@/components/mobile-form-optimized';

export function MyForm() {
  return (
    <MobileForm onSubmit={handleSubmit}>
      {/* Form fields go here */}
    </MobileForm>
  );
}
```

### `MobileTouchInput`
Touch-friendly text input with 48px height.

```typescript
import { MobileTouchInput } from '@/components/mobile-form-optimized';
import { Mail } from 'lucide-react';

<MobileTouchInput
  label="Email"
  type="email"
  placeholder="your@email.com"
  icon={<Mail className="h-5 w-5" />}
  error="Invalid email"
  hint="We'll never share your email"
/>
```

### `MobileTouchTextarea`
Large touch-friendly textarea with character counter.

```typescript
import { MobileTouchTextarea } from '@/components/mobile-form-optimized';

<MobileTouchTextarea
  label="Bio"
  placeholder="Tell us about yourself..."
  maxLength={500}
  characterCount={currentLength}
  hint="Max 500 characters"
/>
```

### `MobileSelect`
Touch-friendly dropdown select.

```typescript
import { MobileSelect } from '@/components/mobile-form-optimized';

<MobileSelect
  label="Country"
  options={[
    { label: 'United States', value: 'us' },
    { label: 'Canada', value: 'ca' },
  ]}
/>
```

### `MobileCheckbox`
Large touch-friendly checkbox.

```typescript
import { MobileCheckbox } from '@/components/mobile-form-optimized';

<MobileCheckbox
  label="Subscribe to newsletter"
  description="Get updates delivered to your inbox"
/>
```

### `MobileRadioGroup`
Touch-friendly radio group.

```typescript
import { MobileRadioGroup } from '@/components/mobile-form-optimized';
import { useState } from 'react';

export function MyForm() {
  const [selected, setSelected] = useState('');

  return (
    <MobileRadioGroup
      name="plan"
      label="Select Plan"
      value={selected}
      onChange={setSelected}
      options={[
        { label: 'Free', value: 'free', description: '$0/month' },
        { label: 'Pro', value: 'pro', description: '$9/month' },
      ]}
    />
  );
}
```

### `MobileButtonGroup`
Button container with proper mobile spacing.

```typescript
import { MobileButtonGroup } from '@/components/mobile-form-optimized';

<MobileButtonGroup stacked>
  <Button variant="primary">Submit</Button>
  <Button variant="outline">Cancel</Button>
</MobileButtonGroup>
```

## 5. Breakpoints Reference

```
xs:  320px   (base)
sm:  640px   (md: prefix)
md:  768px   (md: prefix)
lg:  1024px  (lg: prefix)
xl:  1280px  (xl: prefix)
2xl: 1536px  (2xl: prefix)
```

## 6. Usage Examples

### Example 1: Responsive Home Page

```typescript
import { MobileOptimizedLayout, ResponsiveGrid, ResponsiveContainer } from '@/components/mobile-optimized-layout';
import { useIsMobile } from '@/lib/responsive';

export function HomePage() {
  const isMobile = useIsMobile();

  return (
    <MobileOptimizedLayout sidebar={<Sidebar />}>
      <ResponsiveContainer maxWidth="lg">
        <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold`}>
          Welcome!
        </h1>
        
        <ResponsiveGrid mobileColumns={1} desktopColumns={3} gap="gap-4" className="mt-8">
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </ResponsiveGrid>
      </ResponsiveContainer>
    </MobileOptimizedLayout>
  );
}
```

### Example 2: Mobile-First Form

```typescript
import { MobileForm, MobileTouchInput, MobileButtonGroup } from '@/components/mobile-form-optimized';

export function SignupForm() {
  return (
    <MobileForm onSubmit={handleSubmit}>
      <MobileTouchInput
        label="Full Name"
        placeholder="John Doe"
        required
      />
      <MobileTouchInput
        type="email"
        label="Email"
        placeholder="you@example.com"
        required
      />
      <MobileButtonGroup>
        <Button type="submit">Sign Up</Button>
      </MobileButtonGroup>
    </MobileForm>
  );
}
```

### Example 3: Responsive Navigation

```typescript
import { MobileNavigation, MobileBottomNav } from '@/components/mobile-navigation';
import { useIsDesktop } from '@/lib/responsive';

export function AppLayout({ children }) {
  const isDesktop = useIsDesktop();

  const navItems = [
    { label: 'Home', href: '/', icon: <Home /> },
    { label: 'Browse', href: '/browse', icon: <Search /> },
    { label: 'Teams', href: '/teams', icon: <Users /> },
    { label: 'Profile', href: '/profile', icon: <User /> },
  ];

  return (
    <>
      <header className="border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <Logo />
          {isDesktop && <Desktop Navigation items={navItems} />}
          {!isDesktop && <MobileNavigation items={navItems} />}
        </div>
      </header>
      
      <main>{children}</main>
      
      {!isDesktop && <MobileBottomNav items={navItems} />}
    </>
  );
}
```

## 7. Best Practices

1. **Always Use Touch-Friendly Buttons**: 48px x 48px minimum hit area
2. **Test on Real Devices**: Emulators don't always match real behavior
3. **Use Responsive Units**: Prefer `rem`/`em` over fixed `px` values for text
4. **Optimize Images**: Use `loading="lazy"` and responsive images
5. **Test Touch Interactions**: Ensure adequate spacing between clickable elements
6. **Consider Safe Areas**: Account for notches and rounded corners on modern phones
7. **Use Mobile-First CSS**: Start with mobile styles, add desktop styles with media queries

## 8. Performance Tips

- Use hooks sparingly; they trigger re-renders on resize
- Debounce window resize events
- Use CSS media queries when possible (more efficient than JS)
- Avoid nested responsive components
- Memoize expensive calculations

## 9. Integration with Chat App

These components are ready to integrate into your chat, teams, and admin features:

- Use `MobileNavigation` in chat header
- Use `ResponsiveGrid` for team cards
- Use `MobileTouchInput` in message input
- Use `MobileBottomNav` for main app navigation
- Use `MobileForm` for profile/team creation forms
