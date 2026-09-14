# MTS AL-ITTIHAD PONCOKUSUMO Design Specification

## 1. Overview
This document outlines the design specifications for the MTS AL-ITTIHAD PONCOKUSUMO website, focusing on a clean, reusable, and maintainable design system. The site serves as a central information hub for the institution.

## 2. Experience Goals
The primary goal is to provide clear and accessible information to users, facilitating navigation through academic profiles, administrative details, and news updates. A secondary goal is to engage users with current events and announcements.

## 3. Information Architecture
The site features a prominent header with navigation, a hero section for latest news, a main content area with news and announcements, a sidebar for related links, and a comprehensive footer.

## 4. Layout System
The layout utilizes a flexible box model (`display: flex`) for responsive content arrangement. Key alignment includes `align-items: center` and `justify-content: center`. Content is structured within a `wrapper` class for consistent horizontal spacing.

## 5. Section-by-Section Design Spec
- **Header:** Contains the site logo, title, and primary navigation links.
- **Hero:** Features a rotating banner for prominent news and events.
- **Main Content:** Displays news articles, announcements, and key statistics in a grid or list format.
- **Sidebar:** Lists related links and quick access items.
- **Footer:** Includes contact information, social media links, and utility navigation.

## 6. Component Inventory
- **Navigation:** Primary and secondary navigation links.
- **Buttons:** Standard action buttons and circular buttons.
- **Cards:** Used for news articles and informational blocks, featuring images, titles, and brief descriptions.
- **Forms:** Search bar and polling forms.
- **Image Carousel:** For the hero section.
- **Icons:** Used for navigation, social media, and functional elements.

## 7. Visual Design Specification

### 7.1. Design System Tokens
- **Primary Colors:** `--color-primary-blue: #007bff;` `--color-primary-green: #5cb62f;`
- **Accent Colors:** `--color-accent-yellow: #e7ee20;` `--color-accent-red: #f34545;` `--color-accent-pink: #f824c6;`
- **Neutral Colors:** `--color-neutral-dark: #222;` `--color-neutral-medium: #666;` `--color-neutral-light: #f5f5f5;` `--color-white: #fff;` `--color-black: #000;`
- **Swiper Variables:** `--swiper-theme-color: #007aff;` `--swiper-navigation-size: 44px;` `--swiper-navigation-color: #ffffff;` `--swiper-pagination-color: #ffffff;`

### 7.2. Typography
- **Font Family:** `swiper-icons` (confirm primary text font).
- **Headings:** H1 (`Situs Resmi MTS AL-ITTIHAD PONCOKUSUMO`), H2 for news titles.
- **Body Text:** Standard paragraph text for content.

### 7.3. Color and Surfaces
- **Backgrounds:** Predominantly light surfaces (`#fafafa`, `#f8f9fa`, `#f5f5f5`).
- **Text:** Dark text on light backgrounds (`#222`, `#212121`, `rgba(0, 0, 0, 0.85)`).
- **Interactive Elements:** Blue (`#007bff`, `#0a4ea2`) and green (`#5cb62f`, `#36bd0a`) for links and buttons.
- **Dark Mode:** Signals detected, requiring a full dark theme specification.

### 7.4. Spacing and Rhythm
- **Padding:** `2px`, `3px 5px`, `5px 10px`, `5px 12px`, `8px`, `10px`, `11px 0`, `0 20px`.
- **Margins:** `0`, `7.5pt 0cm`.
- Consistent use of `wrapper` class for horizontal content alignment.

### 7.5. Component Styling
- **Buttons:**
    - `border-radius: 50%` for circular buttons.
    - `box-shadow: 0 0 1px rgba(0, 0, 0, 0.125), 0 1px 3px rgba(0, 0, 0, 0.2)`.
    - `text-transform: none !important`.
- **Cards:**
    - `border: 0`.
    - `box-shadow: 0 0 1px rgba(0, 0, 0, 0.125), 0 1px 3px rgba(0, 0, 0, 0.2)`.
    - `border-radius: 0.25rem` or `10px`.
- **Border Radius:** `0.25rem`, `10px`, `50%`, `100%`.
- **Shadows:** `box-shadow: 0 0 1px rgba(0, 0, 0, 0.125), 0 1px 3px rgba