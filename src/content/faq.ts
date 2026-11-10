/**
 * FAQ copy, lifted verbatim from the production FAQ page.
 */
export type FAQItem = {
  q: string;
  a: string;
};

export type FAQCategory = {
  title: string;
  items: FAQItem[];
};

export const faqCategories: FAQCategory[] = [
  {
    title: 'Getting Started with Ditto',
    items: [
      {
        q: 'How long does implementation take?',
        a: 'Implementation is planned around your preferred start date. We agree on clear milestones so everyone knows what is happening and when. Ditto is cloud-based, so there is nothing to install or set up on a server. Once we create your user accounts, your team can log in immediately. When we say “implementation”, we mainly mean onboarding, training, workflow setup, and data migration. If you have a go-live date, we plan backwards from that date so you are ready on time.',
      },
      {
        q: 'Will you migrate our existing database?',
        a: 'Yes. We migrate databases from all major ATS providers. We start by reviewing the data you provide, including a sample if needed. We then prepare a detailed mapping sheet that shows how each part of your data will look inside Ditto. You review and approve that mapping before we move anything across. Once approved, we run the migration and confirm the result with you. The goal is that your team can work from a complete, usable database as soon as you go live.',
      },
      {
        q: 'Do we lose any data during migration?',
        a: 'No. We take data integrity seriously and we plan the migration properly. We confirm the mapping with you before the migration happens. That means you can see what will be imported and how it will appear in Ditto. Whatever data we receive and you approve is what gets migrated. If anything looks off, we fix it before you go live. The goal is simple: you should not lose data and you should not be surprised.',
      },
      {
        q: 'What systems can you migrate data from?',
        a: 'We migrate data from all major recruitment systems. Most ATS platforms store similar information like candidates, jobs, clients, notes, and attachments. Because of that, migrations are usually straightforward. During onboarding, we review a sample of your data and confirm what will be imported. We then provide a clear mapping plan so you know exactly what to expect. If there are edge cases, we highlight them upfront and agree on the best way to handle them.',
      },
      {
        q: 'Can we import candidates ourselves?',
        a: 'Yes. Recruiters can upload candidates into the system whenever they need to. This is useful for quick additions, proactive sourcing, and keeping the database fresh. Your team can add as many candidates as needed over time. If you need help importing a larger dataset, your account manager can guide you through the best approach. The idea is that you are not blocked and you can keep moving. If you are unsure, just ask and we will help.',
      },
      {
        q: 'What is included in onboarding?',
        a: 'Onboarding is designed to make Ditto match how your team works. We help you set up pipelines, stages, and key workflow settings. We also configure statuses and sources so your data stays clean and consistent. If you are migrating from another system, we manage the migration and confirm the mapping with you first. We build your branded CV submission template into the system as part of onboarding. We also train your team so they know what to do from day one.',
      },
      {
        q: 'How quickly can my team start working?',
        a: 'Very quickly. Once user accounts are created, your team can log in and start working. Because it is cloud-based, there is no waiting for software installs. That said, we recommend doing the initial onboarding first so your settings and workflows are correct. This prevents bad habits and messy data from day one. We also want your team to understand the basics before they go too deep. If you want to start immediately, you can, and we will guide you.',
      },
    ],
  },
  {
    title: 'Training & Onboarding',
    items: [
      {
        q: 'Is training included?',
        a: 'Yes. Training is included for all clients. It is important to us that your team knows how to use Ditto properly. Training is not a once-off thing. If your team needs help later, we can assist again. We want you to get value fast, not struggle for weeks. If someone on your team is stuck, they can reach out and we will help.',
      },
      {
        q: 'How long does training take?',
        a: 'Training depends on your team and how they like to work. Some teams pick it up quickly, and some teams want more guidance. We normally split training into smaller sessions so people do not get overwhelmed. This makes it easier to learn and remember what to do. We focus on practical workflows, not theory. The goal is that your team can do real work inside Ditto after training.',
      },
      {
        q: 'Do you offer onboarding sessions for new recruiters?',
        a: 'Yes. When new recruiters join your business, we can train them too. This helps keep your process consistent across the team. It also reduces mistakes and confusion when someone is new. You do not need to figure it out alone. Simply contact your account manager and we will arrange a session. We want new users to feel confident, not lost.',
      },
      {
        q: 'Can new staff be trained later?',
        a: 'Yes. Training is available at any time. You do not need to train everyone only at the start. As your team grows, we can train new joiners and refresh existing users. This keeps adoption high and prevents “partial usage” of the system. If you change your workflow later, we can help you train around that too. Just let us know and we will schedule it.',
      },
    ],
  },
  {
    title: 'Customisation & Workflow Configuration',
    items: [
      {
        q: 'Can we customise pipelines?',
        a: 'Yes. You can create unlimited hiring pipelines. Each pipeline can have its own stages and naming conventions. This lets you match different client processes and different role types. When you create a job, you simply choose which pipeline to use. This keeps the workflow clear and consistent for the team. It also makes reporting easier because stages mean the same thing across similar jobs.',
      },
      {
        q: 'Can pipelines differ per client or per job?',
        a: 'Yes. Pipelines can differ per client, per department, or per job type. Many agencies use different pipelines for different recruitment models. For example, contingent, retained, contract, and executive search workflows can look very different. Ditto allows you to set those up so the system matches your reality. You choose the pipeline when you create the job. That way you are not forcing every role into one generic workflow.',
      },
      {
        q: 'Can we customise fields and statuses?',
        a: 'Yes. Ditto allows you to customise many workflow elements. This includes candidate statuses, client statuses, job statuses, activity types, email types, candidate sources, and job sources. These settings help keep your database clean and your team aligned. During onboarding, we usually help you set these up based on your workflow. This avoids confusion like different recruiters using different labels for the same thing. The result is better consistency and better reporting.',
      },
      {
        q: 'Can we configure user permissions?',
        a: 'Yes. Ditto is a permission-based system. You can control who can view or edit specific information. This is useful for privacy, control, and clean handovers. It also helps when you have different roles in your business, like recruiters, admins, and managers. Permissions can be set to match your internal rules. If you are unsure what to lock down, we can guide you during onboarding.',
      },
    ],
  },
  {
    title: 'Candidate Search, Matching & AI',
    items: [
      {
        q: 'How accurate is AI search compared to Boolean search?',
        a: 'AI search is generally more accurate because it understands intent and related skills. Boolean search relies on exact keywords, so it can miss good candidates who use different wording. AI search can surface candidates with relevant experience even when the CV does not match your exact phrase. This helps recruiters move faster and shortlist better. It also helps when a brief is changing or not perfectly defined. You still stay in control of the results and how you work.',
      },
      {
        q: 'Can I still use Boolean search?',
        a: 'Yes. Ditto supports both AI search and traditional keyword or Boolean search. Some recruiters prefer Boolean because it feels familiar. Others prefer AI search because it is faster and more flexible. You can switch between them depending on the job. This means you do not need to change your style overnight. Ditto supports modern and legacy approaches side by side.',
      },
      {
        q: 'Can recruiters search the database before posting a job?',
        a: 'Yes. Recruiters can search the database at any time. Many agencies prefer to search their existing database before advertising. Ditto makes this easy with AI search. Recruiters can paste a job description or key requirements into the search to find relevant candidates. This saves time and often reduces job board spend. You can still advertise later if you need more applicants.',
      },
      {
        q: 'Can candidates found in the database be added to a job later?',
        a: 'Yes. If you find a suitable candidate in the database, you can add them to a job at any time. This makes each job a central place for your shortlist. It also keeps your process clean because everyone can see which candidates are linked to the role. You are not limited to only applicants coming from job boards. This supports direct sourcing and proactive recruitment. It also makes it easier to track outcomes per job.',
      },
      {
        q: 'How does candidate matching work?',
        a: 'When you create a job, Ditto analyses the information in the job specification. That includes the key requirements you enter in the job setup. When candidates apply, Ditto compares their profile data and CV attachments to the job requirements. Candidates are then scored and ranked based on how closely they match the role. This reduces manual screening and helps recruiters focus on the best candidates first. You still review and decide, but the system does the heavy lifting.',
      },
      {
        q: 'Can I customise the matching logic?',
        a: 'Yes. During job creation, Ditto generates a matching summary based on your job specification. This shows how candidates will be scored. You can review and edit this summary to prioritise certain skills or experience. This keeps the system transparent and under your control. If the role changes, you can update the matching logic at any time. The goal is that the system follows your rules, not hidden rules.',
      },
      {
        q: 'Can I edit candidate summaries?',
        a: 'Yes. Candidate summaries and candidate fields can be edited whenever needed. The system helps you create a strong summary quickly, but you always control the final result. This is useful when you want to adjust wording for a client. It also helps when you want to add context from your own screening. Ditto is designed to speed you up, not lock you into a fixed output. You decide what gets sent to the client.',
      },
      {
        q: 'Are matching prompts private?',
        a: 'Yes. Matching prompts are private and only visible to your team. They are never shared with candidates. This matters because your matching logic is part of your internal process. We also take privacy seriously, including what you search for and how you shortlist. Your team works with confidence knowing your internal logic stays internal. Only authorised users in your account can access this.',
      },
    ],
  },
  {
    title: 'AI & Personas',
    items: [
      {
        q: 'What are Personas in Ditto?',
        a: 'Personas are instruction sets that shape how Ditto generates or presents output in specific parts of the platform. They help control things like tone, structure, emphasis, strictness, and format, depending on the workflow.',
      },
      {
        q: 'How are Personas used?',
        a: 'Personas are used to guide how the system behaves inside supported AI-assisted features. Instead of giving every output the same treatment, Personas let you choose the style of output that best suits the task.',
      },
      {
        q: 'Where can I use Personas?',
        a: 'Personas can be used across multiple areas of Ditto, including candidate summaries, job advert generation, candidate matching, and candidate writing workflows. Each use case has its own type of Persona based on what the feature is trying to achieve.',
      },
      {
        q: 'What do Personas actually change?',
        a: 'Personas change how the output is framed, not the underlying record itself. Depending on the feature, they can influence tone of voice, level of detail, structure, what gets prioritised, and how strict or broad the system should be.',
      },
      {
        q: 'How flexible are Personas?',
        a: 'Personas are designed to be flexible enough for different hiring styles and recruiter preferences. You might want one approach that is leadership-focused, another that is more delivery-focused, and another that is broader or more conversational. The point is to make the output fit the context, not force everything into one default style.',
      },
      {
        q: 'Do Personas affect candidate matching?',
        a: 'Yes. In candidate matching, Personas can influence how strict or open the evaluation should be. For example, one Persona may focus heavily on non-negotiables, while another may place more weight on transferable skills or broader potential fit.',
      },
      {
        q: 'Do Personas change my source data?',
        a: 'No. Personas do not rewrite your underlying candidate, client, or job data. They shape how the system interprets, evaluates, or presents that data in the output.',
      },
      {
        q: 'Can different teams use different Personas?',
        a: 'Yes. Different teams, recruiters, or workflows often need different output styles. A more corporate tone may suit one client, while a more startup-friendly or delivery-focused style may suit another. Personas make that possible without changing the core data underneath.',
      },
    ],
  },
  {
    title: 'Job Advertising & Candidate Sourcing',
    items: [
      {
        q: 'Can I post to multiple job boards at once?',
        a: 'Yes. With a single click, you can publish your job advert to multiple job boards and aggregators. This saves time and avoids logging into multiple portals. Applications flow back into Ditto so you can manage everything in one place. This keeps your pipeline clean and your process consistent. It also makes it easier to track performance by source. If you prefer, you can still post to fewer channels for more control.',
      },
      {
        q: 'Can premium job boards be connected?',
        a: 'Yes. If you have an account with a premium job board, it can be connected to Ditto. In most cases this only requires an API key or authentication code. The goal is to make it simple and not feel like a complex integration project. Once connected, your team can post from Ditto without bouncing between systems. This improves speed and reduces admin. If you are unsure what you need, we can guide you.',
      },
      {
        q: 'Can recruiters add their own sourced candidates to a job?',
        a: 'Yes. Recruiters can add sourced candidates directly to a job. This means you are not limited to waiting for applicants. Each role becomes a central workspace with applicants and sourced candidates in one place. This is useful for proactive recruiting and headhunting. It also improves collaboration because everyone can see the same shortlist. The job pipeline stays the single source of truth.',
      },
      {
        q: 'Can we track where candidates came from?',
        a: 'Yes. Ditto tracks candidate sources automatically where possible. Recruiters can also create custom source types to match how your business works. If a recruiter sources someone manually, they can assign the source so reporting stays accurate. This helps you understand which channels produce quality candidates. It also helps you see where placements are really coming from. Over time, this improves decisions on where to spend time and money.',
      },
    ],
  },
  {
    title: 'Pipelines, CRM & Team Collaboration',
    items: [
      {
        q: 'Can multiple recruiters work on the same role?',
        a: 'Yes. Ditto is built for collaboration. Multiple recruiters can work on the same job, candidate, or client. This helps teams move faster and avoid duplicate effort. Everyone can see what is happening, so handovers are cleaner. It also prevents the “private spreadsheet” problem that kills visibility. Permissions still apply, so you control who sees what.',
      },
      {
        q: 'Can we track candidate communication?',
        a: 'Yes. Email integration allows communication to be tracked on candidate and client profiles. This means the team can see the conversation history in one place. It helps avoid double contacting candidates and it improves collaboration. Permissions control visibility, so only the right users see the communication if needed. This is especially useful when a recruiter is away or leaves the business. The history remains in Ditto for a clean handover.',
      },
      {
        q: 'Can we assign tasks to team members?',
        a: 'Yes. Tasks can be created as activities and assigned to specific users. This makes follow-ups clear and visible. It also helps managers understand what is being worked on. Tasks can be used for calls, interviews, client feedback, and reminders. This reduces things falling through the cracks. It also creates a reliable activity trail for the job.',
      },
      {
        q: 'Can Ditto generate branded CVs for client submissions?',
        a: 'Yes. During onboarding we build your branded CV submission template into the system. When you find a candidate you want to submit, Ditto can convert the candidate profile into your branded format with one click. The output is a Word document so your team can do a quick final check and edit if needed. This removes the need for recruiters to retype CVs or format documents manually. It saves time and keeps submissions consistent across the team. It also makes your agency look professional on every send.',
      },
      {
        q: 'Can recruiters manage multiple clients and jobs at the same time?',
        a: 'Yes. That is the whole point of using an ATS. Jobs are always linked to a client and a client can have unlimited open roles. Recruiters can manage high volumes of jobs and candidates without losing track. You can filter jobs by client, department, recruiter, and other fields. This reduces admin and makes day-to-day work easier. It also improves visibility across the business.',
      },
      {
        q: 'Can we see the full candidate history?',
        a: 'Yes. Each candidate profile contains a full activity timeline. This includes notes, activities, emails, submissions, and applications. It answers basic questions fast, like who spoke to the candidate and what happened last. It also helps when multiple recruiters work with the same candidate. The history stays in the system, so you do not lose context. This makes handovers and collaboration much easier.',
      },
    ],
  },
  {
    title: 'Integrations',
    items: [
      {
        q: 'What email systems integrate with Ditto?',
        a: 'Ditto integrates with Microsoft 365 and Google Workspace. This connects both email and calendar into the platform. It reduces the need to jump between tools all day. It also helps keep your communication history tied to candidates and clients. The goal is that Ditto feels like part of your existing workflow. If you already use Outlook or Gmail, you can keep using them.',
      },
      {
        q: 'Does Ditto integrate with Outlook and Gmail?',
        a: 'Yes. Ditto integrates with Outlook (Microsoft 365) and Gmail (Google Workspace). Email and calendar events sync between Ditto and your email platform. What you do in Ditto reflects in your inbox, and what you do in your inbox reflects in Ditto. This keeps things consistent and avoids missing messages. It also supports better team visibility when permissions allow it. The integration is designed to be reliable and practical for recruiters.',
      },
      {
        q: 'Does Ditto integrate with calendars?',
        a: 'Yes. Calendar events stay synchronised between Ditto and your email calendar. This helps recruiters manage interviews and client meetings without duplicate admin. Events created in Ditto appear in your calendar, and calendar events can appear in Ditto. This keeps schedules aligned and reduces missed appointments. It also makes it easier to see availability when planning. The goal is simple: one schedule, not two.',
      },
      {
        q: 'Can Ditto connect to external job boards?',
        a: 'Yes. Ditto integrates with job boards, aggregators, and premium job portals. This allows you to post jobs from one place and manage applications centrally. It reduces admin and keeps your pipeline clean. It also helps with source tracking and reporting. Premium portals usually require your own account and credentials. Once connected, your team can work normally inside Ditto.',
      },
      {
        q: 'Does Ditto offer API access?',
        a: 'Yes. API access is available on request. We do not run a public open API that anyone can use without context. If you need API access, contact us and tell us what you want to achieve. We will review your use case and guide you on the best approach. This helps ensure the integration is stable and supported. It also helps us understand your requirements properly before enabling access.',
      },
    ],
  },
  {
    title: 'Support & Customer Success',
    items: [
      {
        q: 'What support channels are available?',
        a: 'Support is available via email and telephone. If your team needs help, you can reach out and we will assist. This includes questions, training support, and troubleshooting. We want the system to feel easy to use, not frustrating. If something is unclear, we would rather you ask than guess. The goal is fast help and a smooth experience.',
      },
      {
        q: 'What are the support hours?',
        a: 'Support is available Monday to Friday, 9am to 5pm. These are standard business hours. If you contact us during these hours, we respond as quickly as possible. If you message outside of business hours, we respond the next business day. Your account manager can also guide you on the best channel for different requests. We keep support simple and direct.',
      },
      {
        q: 'How quickly do you respond to support tickets?',
        a: 'We aim to respond within one hour during business hours. That does not always mean the issue is fully resolved in one hour, but we respond quickly and take ownership. We will ask questions if we need more details. If it is urgent, we prioritise it. If it is a bug, we escalate it immediately. The goal is that you are not left waiting.',
      },
      {
        q: 'Do we get a dedicated account manager?',
        a: 'Yes. Every client receives a dedicated account manager. This person is your main point of contact for onboarding, training, and ongoing support. It removes the “support maze” problem where you never know who to speak to. Your account manager understands your setup and workflow. This helps solve issues faster and keeps onboarding smooth. It also ensures a better long-term relationship.',
      },
      {
        q: 'What happens if something breaks?',
        a: 'Software can sometimes have bugs, and we take that seriously. If your team reports an issue, we investigate quickly. We work to fix problems as fast as possible because recruitment teams rely on the system daily. We also communicate clearly so you know what is happening. The goal is a stable, reliable experience. If something is broken, we do not ignore it.',
      },
    ],
  },
  {
    title: 'Billing, Contracts & Licensing',
    items: [
      {
        q: 'What is the notice period?',
        a: 'Ditto operates on month-to-month contracts with a one calendar month notice period. A calendar month notice means it runs to the end of the next full month. For example, if you give notice on 15 March, your account stays active until the end of April. This is important because many people assume 30 days from the notice date, but it is not the same. We keep it simple and consistent across accounts. If you are unsure, ask your account manager and we will confirm the exact end date.',
      },
      {
        q: 'Can we add users mid-month?',
        a: 'Yes. Users can be added or removed at any time. If you add a user during the month, you are billed pro-rata for the remainder of that month. This keeps billing fair when teams change size. You can scale up or down as your business needs change. The system is designed for real agency life, where teams change. Your account manager can help you manage licensing if needed.',
      },
      {
        q: 'What happens if someone leaves our team mid-month?',
        a: 'Licences are billed monthly in advance. If someone leaves mid-month, the licence remains active until the end of that billing cycle. Your billing will reflect the updated user count from the next month. This means licences do not “roll over” as unused credit. It also means you should monitor active users to avoid paying for seats you do not need. If you need help with this, contact your account manager.',
      },
    ],
  },
  {
    title: 'Data Security & Ownership',
    items: [
      {
        q: 'How is candidate data protected?',
        a: 'All databases are encrypted and access is tightly controlled. Only users in your account can access your data. Permissions help you control what different users can see and do. This protects sensitive candidate and client information. We also treat privacy seriously across the platform. The goal is that your data stays secure and only your team can access it.',
      },
      {
        q: 'Who owns our data?',
        a: 'You own your data. Ditto hosts the data so you can use the platform, but your database belongs to you. If your account ends, you receive a copy of your data once the notice period is completed and the account is up to date. We keep the process straightforward and professional. If you need a specific export format, we can guide you. The goal is that you are never “held hostage” by your system.',
      },
      {
        q: 'Can we export our data?',
        a: 'Yes. Data exports are available throughout the system. Exports are permission-based, so you control who in your team can export sensitive data. This prevents accidental exports by the wrong users. If you need a custom export, contact us and we can help. Many clients use exports for reporting or audits. The key point is that your data is accessible when you need it.',
      },
    ],
  },
  {
    title: 'Questions We Often Hear',
    items: [
      {
        q: 'Will onboarding be painful?',
        a: 'No. Onboarding is carefully planned with you so it feels controlled and smooth. We understand that switching systems can be stressful, especially when a team is busy. That is why we work with clear milestones and regular updates. We keep you informed on what is happening and what is needed from your side. We have onboarded thousands of recruitment teams, so we know the process well. The goal is to make the transition feel simple, not chaotic.',
      },
      {
        q: 'Will my team actually use the system?',
        a: 'Yes. Ditto is designed to become the operating system for your recruitment team. Many clients say, “If it’s not on Ditto, it doesn’t exist.” That is because jobs, candidates, communication, and activity all live in one place. It reduces admin and removes the need for scattered spreadsheets and inbox guesswork. Training and onboarding also help teams adopt the system properly. The goal is real daily usage, not a tool that gets ignored.',
      },
      {
        q: 'Will we lose data?',
        a: 'No. We plan migrations properly and confirm the mapping with you before importing. This gives you visibility into what is moving and how it will appear in Ditto. We take data integrity seriously because your database is your business. The goal is that you go live with a complete and usable database. If something looks wrong, we fix it before you start working. You should feel confident your data is safe.',
      },
      {
        q: 'Will we get locked into contracts?',
        a: 'No. Ditto offers flexible month-to-month contracts. That means you are not forced into long commitments by default. Some clients choose annual plans to receive a discount, but that is optional. If you choose an annual plan, you are paying ahead for the year in exchange for lower pricing. If you prefer flexibility, month-to-month is the standard option. The goal is simple: you choose what fits your business.',
      },
      {
        q: 'Will support disappear after the sale?',
        a: 'No. Support continues for as long as you are a client. You get a dedicated account manager and access to our support team. We treat customer success as a core part of the product, not an afterthought. If you need training later, we do it. If you need help with configuration, we help. The goal is an ongoing relationship, not a quick sale.',
      },
      {
        q: 'Will the system scale as we grow?',
        a: 'Yes. Ditto is built to support growing recruitment teams and high volumes of data. As your team grows, you can add users and adjust workflows. We also keep improving the platform over time. Software is never “finished”, so we keep investing into performance, features, and usability. The goal is that you do not outgrow the system. Ditto should keep up as you scale.',
      },
    ],
  },
];
