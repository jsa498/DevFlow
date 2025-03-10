// Define course content structure
type CourseContent = {
  title: string;
  description: string;
  price: number;
  difficulty_level: string;
  estimated_duration: string;
  prerequisites: string;
  image_url: string;
  published: boolean;
  sections: {
    title: string;
    description: string;
    lessons: {
      title: string;
      description: string;
      content_type: 'video' | 'text' | 'quiz' | 'assignment' | 'pdf';
      content?: any;
      video_url?: string | null;
      pdf_url?: string | null;
      duration?: number | null;
    }[];
  }[];
};

// Predefined course templates
export const COURSE_TEMPLATES: Record<string, CourseContent> = {
  SEO_MASTERY: {
    title: "SEO Mastery: Complete Guide",
    description: "Master the art and science of Search Engine Optimization with this comprehensive guide. Learn about on-page and off-page SEO, technical SEO, keyword research, link building strategies, and how to measure SEO success.",
    price: 99.99,
    difficulty_level: "intermediate",
    estimated_duration: "6 weeks",
    prerequisites: "Basic understanding of web technologies",
    image_url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80",
    published: true,
    sections: [
      {
        title: "Introduction to SEO",
        description: "Learn the fundamentals of SEO and why it matters",
        lessons: [
          {
            title: "What is SEO?",
            description: "Understanding the basics of search engine optimization",
            content_type: "text",
            content: "# Introduction to SEO\n\nSearch Engine Optimization (SEO) is the practice of increasing the quantity and quality of traffic to your website through organic search engine results.\n\n## Why SEO Matters\n\n- Increased visibility in search results\n- Higher quality traffic\n- Better user experience\n- Competitive advantage\n\nIn this course, you'll learn how to optimize your website to rank higher in search engines like Google, Bing, and others."
          },
          {
            title: "How Search Engines Work",
            description: "Understanding the mechanics behind search engines",
            content_type: "text",
            content: "# How Search Engines Work\n\nSearch engines use complex algorithms to determine which pages to show for specific search queries.\n\n## The Three Key Processes\n\n1. **Crawling**: Search engines send out web crawlers to find new and updated content\n2. **Indexing**: The content found during crawling is analyzed and stored in a database\n3. **Ranking**: When a user searches, the engine determines which content is most relevant\n\nUnderstanding these processes is fundamental to successful SEO."
          }
        ]
      },
      {
        title: "On-Page SEO Techniques",
        description: "Optimize individual pages for better rankings",
        lessons: [
          {
            title: "Title Tags and Meta Descriptions",
            description: "Crafting effective title tags and meta descriptions",
            content_type: "text",
            content: "# Title Tags and Meta Descriptions\n\nTitle tags and meta descriptions are HTML elements that provide concise summaries of webpage content.\n\n## Title Tags\n\n- Should be 50-60 characters long\n- Include primary keyword near the beginning\n- Be unique for each page\n- Include your brand name\n\n## Meta Descriptions\n\n- Should be 150-160 characters long\n- Include relevant keywords naturally\n- Have a clear call-to-action\n- Be compelling and relevant to the page content"
          },
          {
            title: "Content Optimization",
            description: "Creating and optimizing content for search engines",
            content_type: "text",
            content: "# Content Optimization\n\nQuality content is the foundation of successful SEO.\n\n## Key Content Optimization Strategies\n\n1. **Keyword Research**: Identify relevant terms your audience is searching for\n2. **Content Structure**: Use headers (H1, H2, H3) to organize content logically\n3. **Readability**: Write clear, concise content that's easy to understand\n4. **Multimedia**: Include images, videos, and other media with proper optimization\n5. **Internal Linking**: Connect related content within your site\n\nRemember that content should be created for users first, then optimized for search engines."
          }
        ]
      }
    ]
  },
  EMAIL_MARKETING: {
    title: "Email Marketing Conversion Tactics",
    description: "Discover proven email marketing strategies that convert subscribers into customers. This guide covers list building, segmentation, automation, copywriting, and analytics to help you create effective email campaigns.",
    price: 79.99,
    difficulty_level: "beginner",
    estimated_duration: "4 weeks",
    prerequisites: "None",
    image_url: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
    published: true,
    sections: [
      {
        title: "Email Marketing Fundamentals",
        description: "Learn the basics of effective email marketing",
        lessons: [
          {
            title: "Why Email Marketing Still Works",
            description: "Understanding the power and ROI of email marketing",
            content_type: "text",
            content: "# Why Email Marketing Still Works\n\nDespite the rise of social media and other digital marketing channels, email marketing remains one of the most effective strategies with the highest ROI.\n\n## Key Benefits\n\n- **Direct Communication**: Reach your audience directly in their inbox\n- **High ROI**: Email marketing averages $42 return for every $1 spent\n- **Ownership**: Unlike social platforms, you own your email list\n- **Personalization**: Highly customizable based on user data\n- **Automation**: Set up sequences that run automatically\n\nIn this course, you'll learn how to leverage these benefits to create effective email marketing campaigns."
          },
          {
            title: "Building Your Email List",
            description: "Strategies for growing a quality email list",
            content_type: "text",
            content: "# Building Your Email List\n\nA quality email list is the foundation of successful email marketing.\n\n## Effective List Building Strategies\n\n1. **Lead Magnets**: Offer valuable content in exchange for email addresses\n2. **Opt-in Forms**: Place strategic signup forms on your website\n3. **Landing Pages**: Create dedicated pages for specific offers\n4. **Content Upgrades**: Offer additional resources related to your content\n5. **Contests and Giveaways**: Run promotions that require email signup\n\nRemember that quality is more important than quantity. Focus on attracting subscribers who are genuinely interested in your offerings."
          }
        ]
      },
      {
        title: "Email Copywriting",
        description: "Learn to write compelling emails that convert",
        lessons: [
          {
            title: "Subject Line Mastery",
            description: "Crafting subject lines that get emails opened",
            content_type: "text",
            content: "# Subject Line Mastery\n\nThe subject line is the most important element of your email - if it doesn't get opened, nothing else matters.\n\n## Subject Line Best Practices\n\n1. **Keep it Short**: 40-50 characters is ideal\n2. **Create Urgency**: Use time-sensitive language when appropriate\n3. **Ask Questions**: Engage readers with relevant questions\n4. **Use Numbers**: Specific numbers can increase open rates\n5. **A/B Test**: Always test different subject lines to see what works\n\nAvoid spam trigger words and misleading subjects that can damage trust with your audience."
          },
          {
            title: "Email Body Structure",
            description: "Creating email content that drives action",
            content_type: "text",
            content: "# Email Body Structure\n\nThe structure of your email content can significantly impact conversion rates.\n\n## Key Elements of Effective Emails\n\n1. **Personalization**: Address subscribers by name when possible\n2. **Clear Value Proposition**: State benefits early in the email\n3. **Scannable Format**: Use short paragraphs, bullets, and subheadings\n4. **Compelling Visuals**: Include relevant images that support your message\n5. **Strong CTA**: Have a clear, prominent call-to-action\n6. **P.S. Section**: Add important information or a secondary CTA\n\nRemember to maintain a consistent voice that aligns with your brand identity."
          }
        ]
      }
    ]
  },
  SOCIAL_MEDIA: {
    title: "Social Media Strategy Blueprint",
    description: "Learn how to create effective social media strategies for businesses of all sizes. This guide includes templates, content calendars, and analytics frameworks to help you build a strong social media presence.",
    price: 89.99,
    difficulty_level: "intermediate",
    estimated_duration: "5 weeks",
    prerequisites: "Basic social media knowledge",
    image_url: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
    published: true,
    sections: [
      {
        title: "Social Media Strategy Fundamentals",
        description: "Learn the core principles of effective social media strategy",
        lessons: [
          {
            title: "Setting Clear Social Media Goals",
            description: "How to establish measurable objectives for your social media efforts",
            content_type: "text",
            content: "# Setting Clear Social Media Goals\n\nEffective social media marketing starts with clearly defined goals that align with your overall business objectives.\n\n## SMART Goal Framework for Social Media\n\n1. **Specific**: Define exactly what you want to accomplish\n2. **Measurable**: Identify metrics to track progress\n3. **Achievable**: Set realistic targets based on resources\n4. **Relevant**: Ensure goals align with business objectives\n5. **Time-bound**: Set deadlines for achieving goals\n\n## Common Social Media Goals\n\n- Increase brand awareness\n- Drive website traffic\n- Generate leads and sales\n- Improve customer service\n- Build community engagement\n- Establish thought leadership\n\nIn this course, you'll learn how to set and track meaningful social media goals."
          },
          {
            title: "Audience Research and Personas",
            description: "Identifying and understanding your target audience",
            content_type: "text",
            content: "# Audience Research and Personas\n\nKnowing your audience is essential for creating relevant social media content that resonates and drives engagement.\n\n## Audience Research Methods\n\n1. **Social Media Analytics**: Review existing follower demographics\n2. **Customer Surveys**: Gather direct feedback from customers\n3. **Competitor Analysis**: Study who engages with similar brands\n4. **Social Listening**: Monitor conversations about your industry\n\n## Creating Social Media Personas\n\nDevelop detailed profiles that include:\n- Demographics (age, location, income, education)\n- Psychographics (interests, values, pain points)\n- Platform preferences and usage habits\n- Content consumption patterns\n- Purchasing behaviors\n\nThese personas will guide your content creation and distribution strategy."
          }
        ]
      },
      {
        title: "Platform-Specific Strategies",
        description: "Tailoring your approach to different social networks",
        lessons: [
          {
            title: "Instagram Strategy",
            description: "Maximizing engagement and growth on Instagram",
            content_type: "text",
            content: "# Instagram Strategy\n\nInstagram offers unique opportunities for visual storytelling and community building.\n\n## Instagram Content Strategy\n\n1. **Feed Posts**: High-quality images and carousels for evergreen content\n2. **Stories**: Behind-the-scenes, polls, and time-sensitive content\n3. **Reels**: Short-form video content to reach new audiences\n4. **IGTV**: Long-form video content for in-depth topics\n5. **Guides**: Curated content collections around specific themes\n\n## Instagram Growth Tactics\n\n- Consistent posting schedule (3-5 times per week)\n- Strategic hashtag usage (mix of broad and niche tags)\n- Engagement pods or communities\n- Collaborations with complementary accounts\n- Cross-promotion with other platforms\n\nRemember that Instagram's algorithm favors accounts that drive meaningful interactions."
          },
          {
            title: "LinkedIn Strategy",
            description: "Building professional authority and generating B2B leads",
            content_type: "text",
            content: "# LinkedIn Strategy\n\nLinkedIn is the premier platform for B2B marketing, professional networking, and thought leadership.\n\n## LinkedIn Content Strategy\n\n1. **Text Posts**: Share industry insights and professional experiences\n2. **Articles**: Publish long-form content on LinkedIn's publishing platform\n3. **Documents**: Share slideshows, PDFs, and other resources\n4. **Videos**: Share short professional videos with captions\n5. **Polls**: Engage your network with relevant industry questions\n\n## LinkedIn Growth Tactics\n\n- Optimize your company page and personal profile\n- Join and participate in relevant industry groups\n- Engage with content from industry leaders\n- Share a mix of original and curated content\n- Maintain a consistent posting schedule (3-5 times per week)\n\nLinkedIn's algorithm favors content that generates conversations in the early hours after posting."
          }
        ]
      }
    ]
  },
  DIGITAL_MARKETING: {
    title: "Digital Marketing Fundamentals Guide",
    description: "A comprehensive guide covering all the basics of digital marketing, including SEO, social media marketing, content marketing, email marketing, and analytics. Perfect for beginners looking to build a solid foundation.",
    price: 129.99,
    difficulty_level: "beginner",
    estimated_duration: "8 weeks",
    prerequisites: "None",
    image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2015&q=80",
    published: true,
    sections: [
      {
        title: "Digital Marketing Overview",
        description: "Introduction to the digital marketing landscape",
        lessons: [
          {
            title: "The Digital Marketing Ecosystem",
            description: "Understanding how different digital marketing channels work together",
            content_type: "text",
            content: "# The Digital Marketing Ecosystem\n\nDigital marketing encompasses a wide range of channels and strategies that work together to create a comprehensive online presence.\n\n## Core Digital Marketing Channels\n\n1. **Search Engine Optimization (SEO)**: Improving organic visibility in search results\n2. **Content Marketing**: Creating valuable content to attract and engage audiences\n3. **Social Media Marketing**: Building brand presence and engagement on social platforms\n4. **Email Marketing**: Direct communication with prospects and customers\n5. **Paid Advertising**: PPC, display ads, and paid social campaigns\n6. **Affiliate Marketing**: Partnering with others to promote products/services\n\n## How These Channels Work Together\n\nEffective digital marketing integrates multiple channels to create a cohesive customer journey. For example:\n- Content created for your blog supports SEO efforts\n- Social media amplifies content reach\n- Email nurtures leads generated from other channels\n- Paid advertising can boost visibility while organic strategies develop\n\nIn this course, you'll learn how to develop an integrated digital marketing strategy."
          },
          {
            title: "Setting Digital Marketing Goals",
            description: "Establishing clear objectives for your digital marketing efforts",
            content_type: "text",
            content: "# Setting Digital Marketing Goals\n\nClear goals are essential for measuring the success of your digital marketing efforts.\n\n## The Digital Marketing Funnel\n\n1. **Awareness**: Introducing your brand to potential customers\n2. **Consideration**: Nurturing interest in your products/services\n3. **Conversion**: Turning prospects into customers\n4. **Retention**: Keeping customers engaged and loyal\n5. **Advocacy**: Encouraging customers to promote your brand\n\n## Aligning Goals with Business Objectives\n\nDigital marketing goals should directly support broader business objectives:\n- Increasing revenue\n- Expanding market share\n- Entering new markets\n- Improving customer retention\n- Building brand reputation\n\n## Measuring Success with KPIs\n\nFor each goal, identify specific Key Performance Indicators (KPIs):\n- Website traffic and sources\n- Conversion rates\n- Cost per acquisition\n- Customer lifetime value\n- Engagement metrics\n\nThis framework will help you create a goal-oriented digital marketing strategy."
          }
        ]
      },
      {
        title: "Website Optimization",
        description: "Creating an effective foundation for your digital presence",
        lessons: [
          {
            title: "Website Structure and User Experience",
            description: "Building a website that converts visitors into customers",
            content_type: "text",
            content: "# Website Structure and User Experience\n\nYour website is the hub of your digital marketing efforts and often the final destination for converting prospects into customers.\n\n## Key Elements of Effective Website Structure\n\n1. **Clear Navigation**: Intuitive menus that help users find what they need\n2. **Logical Information Architecture**: Content organized in a way that makes sense\n3. **Consistent Layout**: Similar page structures throughout the site\n4. **Mobile Responsiveness**: Optimal experience across all devices\n5. **Fast Loading Speed**: Pages that load in under 3 seconds\n\n## User Experience Best Practices\n\n- **Clear Value Proposition**: Communicate benefits above the fold\n- **Strategic CTAs**: Prominent, action-oriented buttons with clear direction\n- **Visual Hierarchy**: Guide users' attention to important elements\n- **White Space**: Use adequate spacing to improve readability\n- **Accessibility**: Ensure your site works for all users, including those with disabilities\n\nRemember that every page should have a clear purpose in the customer journey."
          },
          {
            title: "Conversion Rate Optimization",
            description: "Techniques to improve website conversion rates",
            content_type: "text",
            content: "# Conversion Rate Optimization\n\nConversion Rate Optimization (CRO) is the systematic process of increasing the percentage of website visitors who take desired actions.\n\n## The CRO Process\n\n1. **Research**: Analyze current performance using analytics and user behavior tools\n2. **Hypothesis**: Develop theories about what changes might improve conversions\n3. **Prioritization**: Decide which changes to test first based on potential impact\n4. **Testing**: Implement A/B or multivariate tests to compare variations\n5. **Analysis**: Evaluate results and implement winning variations\n\n## Common CRO Techniques\n\n- **Simplified Forms**: Reduce fields to minimum required information\n- **Social Proof**: Add testimonials, reviews, and case studies\n- **Urgency/Scarcity**: Create time-limited offers or limited availability\n- **Clear CTAs**: Improve button text, color, and placement\n- **Streamlined Checkout**: Remove friction from purchase process\n- **Trust Signals**: Add security badges, guarantees, and privacy assurances\n\nCRO is an ongoing process of continuous improvement rather than a one-time project."
          }
        ]
      }
    ]
  }
}; 