# Automatic Course Creation Guide

This document provides information about the automatic course creation functionality in the DevFlow platform.

## Overview

The platform now supports fully automatic course creation with zero manual effort. Predefined course templates are automatically created when you access the Course Management page for the first time.

## How Courses Are Created

1. **Access the Admin Dashboard**
   - Log in with your admin account
   - Navigate to the Admin Dashboard

2. **Go to Course Management**
   - Click on "Course Management" in the Admin Dashboard
   - If no courses exist, they will be automatically created
   - You'll see a success message when the process is complete

3. **Manage Created Courses**
   - After automatic creation, courses will appear in the Course Management list
   - You can edit, preview, or delete courses as needed
   - Courses are automatically published and will appear on the home page

4. **Manual Creation (if needed)**
   - If you need to recreate courses, you can click the "Create Courses" button
   - This will only create courses that don't already exist

## Available Course Templates

The following course templates are automatically created:

1. **SEO Mastery: Complete Guide**
   - Comprehensive guide to Search Engine Optimization
   - Price: $99.99
   - Difficulty: Intermediate
   - Duration: 6 weeks

2. **Email Marketing Conversion Tactics**
   - Strategies for effective email marketing campaigns
   - Price: $79.99
   - Difficulty: Beginner
   - Duration: 4 weeks

3. **Social Media Strategy Blueprint**
   - Framework for creating effective social media strategies
   - Price: $89.99
   - Difficulty: Intermediate
   - Duration: 5 weeks

4. **Digital Marketing Fundamentals Guide**
   - Comprehensive introduction to digital marketing
   - Price: $129.99
   - Difficulty: Beginner
   - Duration: 8 weeks

## Deleting Courses

When you delete a course:
1. All associated lessons are deleted first
2. Then all sections are deleted
3. The course itself is deleted
4. Finally, the product associated with the course is deleted

This ensures that all related data is properly removed from the database.

## Technical Implementation

The automatic course creation functionality is implemented through:

1. An API endpoint at `/api/admin/create-courses` that handles the creation of courses, sections, and lessons
2. Predefined course templates stored in `src/lib/course-templates.ts`
3. Integration with the Supabase database to store course data
4. Automatic creation when the Course Management page loads with no existing courses
5. Duplicate prevention by checking for existing courses before creating new ones

For any technical issues or questions, please refer to the codebase or contact the development team. 