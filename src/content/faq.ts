/**
 * FAQ copy, from the production FAQ page as edited by brief v2.2 section 3.8 (topic titles in sentence case, as in
 * Figma 2421:2028). The hero's counts are worked out from this list.
 */
export type FAQItem = {
  q: string;
  a: string;
};

export type FAQCategory = {
  title: string;
  /** The rail's shorter label, where it differs from the title. */
  rail?: string;
  /** A fixed link id (/faq#ai-assistant), where the title's own slug won't do. */
  id?: string;
  items: FAQItem[];
};

export const faqCategories: FAQCategory[] = [
  {
    title: 'Getting started with Ditto',
    items: [
      {
        q: 'How long does implementation take?',
        a: 'Implementation is planned around your preferred start date. We agree on clear milestones so everyone knows what is happening and when. Ditto is cloud-based, so there is nothing to install or set up on a server. Once we create your user accounts, your team can log in immediately. When we say “implementation”, we mainly mean onboarding, training, workflow setup, and data migration. If you have a go-live date, we plan backwards from that date so you are ready on time.',
      },
      {
        q: 'Will you migrate our existing database?',
        a: 'Yes. We migrate your candidate records, client records, files and documents, and historical interactions from all major recruitment systems. We review a sample of your data, prepare a mapping sheet that shows how it will look in Ditto, and only migrate once you have approved it.',
      },
      {
        q: 'Do we lose any data during migration?',
        a: 'No. You see and approve the mapping before anything moves, so you know exactly what will be imported and how it will appear. If anything looks off, we fix it before you go live.',
      },
      {
        q: 'What systems can you migrate data from?',
        a: 'All major recruitment systems. Most store similar information: candidates, clients, notes and attachments. During onboarding we review a sample, confirm what will be imported and flag any edge cases upfront.',
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
    id: 'ai-assistant',
    rail: 'AI assistant',
    title: 'Ditto for Claude, ChatGPT and Copilot',
    items: [
      {
        q: 'What is Ditto for Claude, ChatGPT and Copilot?',
        a: 'It is a connection between Ditto and the AI assistant you already use. Once connected, you can ask your assistant to search your Ditto database, add candidates, update pipelines, log activity, create placements and pull reports, in plain language. It works on your agency’s live data, not a copy.',
      },
      {
        q: 'Which AI assistants does it work with?',
        a: 'Claude, ChatGPT and Microsoft Copilot. You use your own account with the assistant and connect it to Ditto by signing in with your Ditto login.',
      },
      {
        q: 'Do I need a paid AI plan?',
        a: 'No. Ditto connects to Claude, ChatGPT and Microsoft Copilot on any plan, including free accounts. If your company manages your assistant, an admin may need to switch the connection on first.',
      },
      {
        q: 'What can I ask it to do?',
        a: 'Find and shortlist candidates from a job spec. Add a candidate from a CV or LinkedIn profile and shortlist them for a job. Create clients, contacts and jobs. Move applicants between stages. Log calls, meetings and notes. Create tasks and reminders. Create placements and draft the invoice. Pull placement and activity numbers for you or your team.',
      },
      {
        q: 'Can the assistant see everything in our database?',
        a: 'No. It acts as the recruiter who is signed in, with that recruiter’s permissions. If a recruiter cannot see something in Ditto, the assistant cannot see it either.',
      },
      {
        q: 'Does it change records without me knowing?',
        a: 'No. It only makes a change when you ask for it, it tells you what it changed, and every action is recorded in Ditto under your name. It checks for duplicates before it creates a candidate, client or job.',
      },
      {
        q: 'Will it email candidates or clients for me?',
        a: 'No. It drafts messages and summaries for you to review and send yourself. Ditto does not send emails or calendar invites on your behalf.',
      },
      {
        q: 'Is our data used to train AI?',
        a: 'Ditto never uses your candidate or client data to train AI models. Your assistant provider has its own rules. On personal plans, chats may be used to improve the provider’s models unless you switch that off in your settings. Business plans do not use them by default. Check this setting before you connect Ditto.',
      },
      {
        q: 'Do I have to use an AI assistant to use Ditto?',
        a: 'No. Ditto works fully in the browser, with its own built-in AI search, matching, summaries and job ad writing. The assistant connection is one more way to work.',
      },
      {
        q: 'Is this the same as “MCP”?',
        a: 'Yes. It is built on the Model Context Protocol (MCP), the open standard that lets AI assistants work securely with other software.',
      },
    ],
  },
  {
    title: 'Training & onboarding',
    items: [
      {
        q: 'Is training included?',
        a: 'Yes. Training is included for all clients. It is important to us that your team knows how to use Ditto properly. Training is not a once-off thing. If your team needs help later, we can assist again. We want you to get value fast, not struggle for weeks. If someone on your team is stuck, they can reach out and we will help.',
      },
      {
        q: 'How long does training take?',
        a: 'Training depends on your team and how they like to work. Some teams pick it up quickly, and some teams want more guidance. We normally split training into smaller sessions so people do not get overwhelmed. This makes it easier to learn and remember what to do. We focus on practical workflows, not theory.',
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
    title: 'Customisation & workflow configuration',
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
    title: 'Candidate search, matching & AI',
    items: [
      {
        q: 'How accurate is AI search compared to Boolean search?',
        a: 'AI search is generally more accurate because it understands intent and related skills. Boolean search relies on exact keywords, so it can miss good candidates who use different wording. AI search can surface candidates with relevant experience even when the CV does not match your exact phrase. This helps recruiters move faster and shortlist better. It also helps when a brief is changing or not perfectly defined. You still stay in control of the results and how you work.',
      },
      {
        q: 'Can I still use Boolean search?',
        a: 'Yes. Ditto supports both AI search and traditional keyword or Boolean search. Some recruiters prefer Boolean because it feels familiar. Others prefer AI search because it is faster and more flexible. You can switch between them depending on the job. This means you do not need to change your style overnight. You can use both side by side.',
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
        a: 'Yes. When you create a job, Ditto shows a summary of how applicants will be scored. Edit it to prioritise the skills and experience that matter most, and update it whenever the role changes.',
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
    title: 'AI & personas',
    items: [
      {
        q: 'What are Personas in Ditto?',
        a: 'Personas are saved instructions that tell Ditto’s AI how you want something written or judged. For example, a “Client submission” Persona can make every candidate summary formal, three paragraphs long and focused on leadership experience.',
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
    title: 'Job advertising & candidate sourcing',
    items: [
      {
        q: 'Can I post to multiple job boards at once?',
        a: 'Yes. With a single click, you can publish your job advert to multiple job boards and aggregators. This saves time and avoids logging into multiple portals. Applications flow back into Ditto so you can manage everything in one place. This keeps your pipeline clean and your process consistent. It also makes it easier to track performance by source. If you prefer, you can still post to fewer channels for more control.',
      },
      {
        q: 'Can premium job boards be connected?',
        a: 'Yes. If you have an account with a premium job board, it can be connected to Ditto. In most cases this only requires an API key or authentication code. Once connected, your team can post from Ditto without bouncing between systems. This improves speed and reduces admin. If you are unsure what you need, we can guide you.',
      },
      {
        q: 'Can we track where candidates came from?',
        a: 'Yes. Ditto tracks candidate sources automatically where possible. Recruiters can also create custom source types to match how your business works. If a recruiter sources someone manually, they can assign the source so reporting stays accurate. This helps you understand which channels produce quality candidates. It also helps you see where placements are really coming from. Over time, this improves decisions on where to spend time and money.',
      },
    ],
  },
  {
    title: 'Pipelines, CRM & team collaboration',
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
        a: 'Yes. Jobs are always linked to a client and a client can have unlimited open roles. Recruiters can manage high volumes of jobs and candidates without losing track. You can filter jobs by client, department, recruiter, and other fields. This reduces admin and makes day-to-day work easier. It also improves visibility across the business.',
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
        a: 'Ditto integrates with Microsoft 365 and Google Workspace. This connects both email and calendar into the platform. It reduces the need to jump between tools all day. It also helps keep your communication history tied to candidates and clients. If you already use Outlook or Gmail, you can keep using them.',
      },
      {
        q: 'Does Ditto integrate with calendars?',
        a: 'Yes. Calendar events stay synchronised between Ditto and your email calendar. This helps recruiters manage interviews and client meetings without duplicate admin. Events created in Ditto appear in your calendar, and calendar events can appear in Ditto. This keeps schedules aligned and reduces missed appointments. It also makes it easier to see availability when planning.',
      },
      {
        q: 'Can Ditto connect to external job boards?',
        a: 'Yes. Ditto integrates with job boards, aggregators, and premium job portals. This allows you to post jobs from one place and manage applications centrally. It reduces admin and keeps your pipeline clean. It also helps with source tracking and reporting. Premium portals usually require your own account and credentials. Once connected, your team can work normally inside Ditto.',
      },
      {
        q: 'Does Ditto offer API access?',
        a: 'Yes, on request. Tell us what you want to achieve and we will guide you on the best approach. If you want to work with Ditto from an AI assistant, you don’t need the API. See Ditto for Claude, ChatGPT and Copilot.',
      },
    ],
  },
  {
    title: 'Support & customer success',
    items: [
      {
        q: 'What support channels are available?',
        a: 'Email, phone and WhatsApp. Where it makes sense, we also come to your office for training.',
      },
      {
        q: 'What are the support hours?',
        a: 'Monday to Friday, 09:00 to 17:00, South African time. If you contact us outside those hours, we respond on the next business day.',
      },
      {
        q: 'How quickly do you respond to support tickets?',
        a: 'We aim to respond within one hour during business hours. That does not always mean the issue is fully resolved in one hour, but we respond quickly and take ownership. We will ask questions if we need more details. If it is urgent, we prioritise it. If it is a bug, we escalate it immediately.',
      },
      {
        q: 'Do we get a dedicated account manager?',
        a: 'Yes. Every client receives a dedicated account manager. This person is your main point of contact for onboarding, training, and ongoing support. It removes the “support maze” problem where you never know who to speak to. Your account manager understands your setup and workflow. This helps solve issues faster and keeps onboarding smooth. It also ensures a better long-term relationship.',
      },
      {
        q: 'What happens if something breaks?',
        a: 'Software can sometimes have bugs, and we take that seriously. If your team reports an issue, we investigate quickly. We work to fix problems as fast as possible because recruitment teams rely on the system daily. We also communicate clearly so you know what is happening. If something is broken, we do not ignore it.',
      },
    ],
  },
  {
    title: 'Billing, contracts & licensing',
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
    title: 'Data security & ownership',
    items: [
      {
        q: 'How is candidate data protected?',
        a: 'Each agency’s data sits in its own separate database schema. Data is encrypted at rest and in transit, and every action in the platform is recorded in an audit log. Only recruiters in your account can access your data, and permissions control what each of them can see and do.',
      },
      {
        q: 'Who owns our data?',
        a: 'You own your data. Ditto hosts the data so you can use the platform, but your database belongs to you. If your account ends, you receive a copy of your data once the notice period is completed and the account is up to date. We keep the process straightforward and professional. If you need a specific export format, we can guide you.',
      },
      {
        q: 'Can we export our data?',
        a: 'Yes. Data exports are available throughout the system. Exports are permission-based, so you control who in your team can export sensitive data. This prevents accidental exports by the wrong users. If you need a custom export, contact us and we can help. Many clients use exports for reporting or audits. The key point is that your data is accessible when you need it.',
      },
      {
        q: 'Is our data used to train AI?',
        a: 'No. Ditto never uses your candidate or client data to train AI models.',
      },
    ],
  },
  {
    title: 'Common concerns',
    items: [
      {
        q: 'Will onboarding be painful?',
        a: 'No. We plan it with you, with clear milestones and regular updates, so you always know what is happening and what we need from you. We have been onboarding agencies of every size since 2016.',
      },
      {
        q: 'Will my team actually use the system?',
        a: 'Yes. Jobs, candidates, communication and activity all live in one place, so Ditto becomes where the work happens, not an extra admin step. Training is included for every recruiter, including those who join later.',
      },
      {
        q: 'Will we get locked into contracts?',
        a: 'No. Month to month is the standard, with one calendar month’s notice. Some clients choose an annual plan, paid once upfront, for a 15% lower price. That is optional.',
      },
      {
        q: 'Will support disappear after the sale?',
        a: 'No. Support continues for as long as you are a client. You get a dedicated account manager and access to our support team. We treat customer success as a core part of the product, not an afterthought. If you need training later, we do it. If you need help with configuration, we help.',
      },
      {
        q: 'Will the system scale as we grow?',
        a: 'Yes. Ditto is built to support growing recruitment teams and high volumes of data. As your team grows, you can add users and adjust workflows. We also keep improving the platform over time. Software is never “finished”, so we keep investing into performance, features, and usability. Ditto should keep up as you scale.',
      },
    ],
  },
];
