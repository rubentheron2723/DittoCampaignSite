/**
 * FAQ copy, from the production FAQ page as edited by brief v2.2 section 3.8 (topic titles in sentence case, as in
 * Figma 2421:2028), with answers kept to three or four sentences. The brief's AI assistant topic is left out, and so
 * is its "Is our data used to train AI?" answer, which Privacy 18 and Terms 14 currently contradict. The hero's counts
 * are worked out from this list.
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
    title: 'Getting started with Ditto',
    items: [
      {
        q: 'How long does implementation take?',
        a: 'We plan implementation around your preferred start date, with clear milestones, and work backwards from your go-live date so you are ready on time. By implementation we mean onboarding, training, workflow setup and data migration. Ditto is cloud-based, so there is nothing to install. Once we create your user accounts, your team can log in immediately.',
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
        a: 'Yes. Recruiters can upload candidates whenever they need to, as many as they like, for quick additions or proactive sourcing. If you need to import a larger dataset, your account manager will guide you through the best approach.',
      },
      {
        q: 'What is included in onboarding?',
        a: 'Onboarding sets Ditto up to match how your team works: pipelines, stages, statuses, sources and key workflow settings. If you are moving from another system, we manage the migration and confirm the mapping with you first. We also build your branded CV submission template and train your team, so they know what to do from day one.',
      },
      {
        q: 'How quickly can my team start working?',
        a: 'Very quickly. Once user accounts are created, your team can log in and start working, with no software to install. We recommend doing the initial onboarding first, so your settings and workflows are right from day one. If you want to start immediately, you can, and we will guide you.',
      },
    ],
  },
  {
    title: 'Training & onboarding',
    items: [
      {
        q: 'Is training included?',
        a: 'Yes. Training is included for all clients, and it is not a once-off. If your team needs help later, or someone gets stuck, they can reach out and we will help.',
      },
      {
        q: 'How long does training take?',
        a: 'It depends on your team and how they like to work. We normally split training into short, practical sessions so people are not overwhelmed. We focus on real workflows, not theory.',
      },
      {
        q: 'Do you offer onboarding sessions for new recruiters?',
        a: 'Yes. When new recruiters join your business, we train them too, which keeps your process consistent and reduces early mistakes. Contact your account manager and we will arrange a session.',
      },
      {
        q: 'Can new staff be trained later?',
        a: 'Yes. Training is available at any time, not only at the start. As your team grows, we train new joiners and refresh existing users, and if your workflow changes, we can train around that too. Just let us know and we will schedule it.',
      },
    ],
  },
  {
    title: 'Customisation & workflow configuration',
    items: [
      {
        q: 'Can we customise pipelines?',
        a: 'Yes. You can create unlimited hiring pipelines, each with its own stages and names, to match different client processes and role types. When you create a job, you choose which pipeline to use. Stages then mean the same thing across similar jobs, which keeps reporting clear.',
      },
      {
        q: 'Can pipelines differ per client or per job?',
        a: 'Yes. Pipelines can differ per client, department or job type. Contingent, retained, contract and executive search workflows can each have their own. You choose the pipeline when you create the job, so no role is forced into one generic workflow.',
      },
      {
        q: 'Can we customise fields and statuses?',
        a: 'Yes. You can customise candidate, client and job statuses, activity types, email types, and candidate and job sources. We usually set these up with you during onboarding, so every recruiter uses the same labels. That keeps your database clean and your reporting consistent.',
      },
      {
        q: 'Can we configure user permissions?',
        a: 'Yes. Ditto is permission-based, so you control who can view or edit specific information. Permissions can match your internal rules for different roles, such as recruiters, admins and managers. If you are unsure what to lock down, we will guide you during onboarding.',
      },
    ],
  },
  {
    title: 'Candidate search, matching & AI',
    items: [
      {
        q: 'How accurate is AI search compared to Boolean search?',
        a: 'AI search is generally more accurate because it understands intent and related skills. Boolean search relies on exact keywords, so it can miss good candidates whose CVs use different wording. AI search also helps when a brief is changing or not fully defined. You stay in control of the results either way.',
      },
      {
        q: 'Can I still use Boolean search?',
        a: 'Yes. Ditto supports both AI search and traditional keyword or Boolean search. Some recruiters prefer Boolean because it feels familiar, others prefer AI search because it is faster and more flexible. You can use both side by side.',
      },
      {
        q: 'Can recruiters search the database before posting a job?',
        a: 'Yes. Recruiters can search the database at any time, and many agencies do before advertising. Paste a job description or key requirements into AI search to find relevant candidates. It saves time and often reduces job board spend, and you can still advertise later if you need more applicants.',
      },
      {
        q: 'Can candidates found in the database be added to a job later?',
        a: 'Yes. You can add any candidate from the database to a job at any time, not only applicants from job boards. Each job becomes the central place for its shortlist, so everyone can see who is linked to the role. It also makes outcomes easier to track per job.',
      },
      {
        q: 'How does candidate matching work?',
        a: 'When you create a job, Ditto analyses the job specification and the key requirements you enter. As candidates apply, it compares their profile and CV to those requirements, then scores and ranks them. You still review and decide, but you start with the best matches.',
      },
      {
        q: 'Can I customise the matching logic?',
        a: 'Yes. When you create a job, Ditto shows a summary of how applicants will be scored. Edit it to prioritise the skills and experience that matter most, and update it whenever the role changes.',
      },
      {
        q: 'Can I edit candidate summaries?',
        a: 'Yes. Candidate summaries and fields can be edited whenever needed. Ditto helps you write a strong summary quickly, and you can adjust the wording for a client or add context from your own screening. You decide what gets sent to the client.',
      },
      {
        q: 'Are matching prompts private?',
        a: 'Yes. Matching prompts are only visible to authorised users in your account and are never shared with candidates. Your matching logic stays part of your internal process.',
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
        a: 'Yes. With one click you can publish a job advert to multiple job boards and aggregators, without logging into each portal. Applications flow back into Ditto, so you manage everything in one place and can track performance by source. You can still post to fewer channels if you prefer.',
      },
      {
        q: 'Can premium job boards be connected?',
        a: 'Yes. If you have an account with a premium job board, it can be connected to Ditto, usually with an API key or authentication code. Your team can then post from Ditto without switching systems. If you are unsure what you need, we will guide you.',
      },
      {
        q: 'Can we track where candidates came from?',
        a: 'Yes. Ditto tracks candidate sources automatically where it can, and recruiters can assign a source when they find someone manually. You can also create custom source types. Over time, this shows which channels produce quality candidates and placements, so you know where to spend time and money.',
      },
    ],
  },
  {
    title: 'Pipelines, CRM & team collaboration',
    items: [
      {
        q: 'Can multiple recruiters work on the same role?',
        a: 'Yes. Several recruiters can work on the same job, candidate or client. Everyone can see what is happening, which avoids duplicate effort and makes handovers cleaner. Permissions still apply, so you control who sees what.',
      },
      {
        q: 'Can we track candidate communication?',
        a: 'Yes. Email integration tracks communication on candidate and client profiles, so the team can see the full conversation history in one place. That avoids contacting candidates twice and keeps a clean handover when a recruiter is away or leaves. Permissions control who can see what.',
      },
      {
        q: 'Can we assign tasks to team members?',
        a: 'Yes. Tasks can be created as activities and assigned to specific users, for calls, interviews, client feedback and reminders. Follow-ups stay clear and visible, managers can see what is being worked on, and nothing falls through the cracks.',
      },
      {
        q: 'Can Ditto generate branded CVs for client submissions?',
        a: 'Yes. During onboarding we build your branded CV template into Ditto. With one click, Ditto turns a candidate profile into your branded format as a Word document, ready for a final check. Recruiters no longer retype or format CVs, and every submission looks consistent.',
      },
      {
        q: 'Can recruiters manage multiple clients and jobs at the same time?',
        a: 'Yes. Jobs are always linked to a client, and a client can have unlimited open roles. Recruiters can manage high volumes of jobs and candidates and filter them by client, department, recruiter and other fields.',
      },
      {
        q: 'Can we see the full candidate history?',
        a: 'Yes. Each candidate profile has a full activity timeline: notes, activities, emails, submissions and applications. Anyone can see who spoke to the candidate and what happened last. The history stays in Ditto, so handovers keep their context.',
      },
    ],
  },
  {
    title: 'Integrations',
    items: [
      {
        q: 'What email systems integrate with Ditto?',
        a: 'Ditto integrates with Microsoft 365 and Google Workspace, connecting both email and calendar. You can keep using Outlook or Gmail. Emails and meetings attach to the right candidates and clients, and you choose which emails are shared with the team and which stay private.',
      },
      {
        q: 'Does Ditto integrate with calendars?',
        a: 'Yes. Calendar events stay in sync between Ditto and your email calendar, in both directions. Recruiters can manage interviews and client meetings without entering them twice, and see availability when planning.',
      },
      {
        q: 'Can Ditto connect to external job boards?',
        a: 'Yes. Ditto integrates with job boards, aggregators and premium job portals, so you post from one place and manage applications centrally. Premium portals usually need your own account and credentials. Once connected, your team works inside Ditto as normal.',
      },
      {
        q: 'Does Ditto offer API access?',
        a: 'Yes, on request. Tell us what you want to achieve and we will guide you on the best approach.',
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
        a: 'We aim to respond within one hour during business hours. A response is not always a fix, but we take ownership straight away and ask for any details we need. Urgent issues are prioritised and bugs are escalated immediately.',
      },
      {
        q: 'Do we get a dedicated account manager?',
        a: 'Yes. Every client has a dedicated account manager, your main contact for onboarding, training and ongoing support. They understand your setup and workflow, so issues get solved faster.',
      },
      {
        q: 'What happens if something breaks?',
        a: 'Software can have bugs, and we take them seriously. If your team reports an issue, we investigate quickly and work to fix it as fast as possible, because recruitment teams rely on Ditto every day. We keep you updated so you always know what is happening.',
      },
    ],
  },
  {
    title: 'Billing, contracts & licensing',
    items: [
      {
        q: 'What is the notice period?',
        a: 'Ditto is month to month, with one calendar month’s notice. That runs to the end of the next full month, not 30 days from the notice date: notice given on 15 March means your account stays active until the end of April. Your account manager can confirm your exact end date.',
      },
      {
        q: 'Can we add users mid-month?',
        a: 'Yes. Users can be added or removed at any time. A user added during the month is billed pro rata for the rest of that month, so billing stays fair as your team changes. Your account manager can help you manage licences.',
      },
      {
        q: 'What happens if someone leaves our team mid-month?',
        a: 'Licences are billed monthly in advance, so a licence stays active until the end of that billing cycle. Your bill reflects the updated user count from the next month, and unused time does not roll over as credit. Your account manager can help you keep active users up to date.',
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
        a: 'You do. Ditto hosts your data so you can use the platform, but your database belongs to you. If your account ends, you receive a copy of your data once the notice period is over and the account is up to date. If you need a specific export format, we will guide you.',
      },
      {
        q: 'Can we export our data?',
        a: 'Yes. Data exports are available throughout the system and are permission-based, so you control who can export sensitive data. If you need a custom export, for reporting or an audit, contact us and we will help.',
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
        a: 'No. Support continues for as long as you are a client, through your dedicated account manager and our support team. If you need training or help with configuration later, we do it.',
      },
      {
        q: 'Will the system scale as we grow?',
        a: 'Yes. Ditto is built for growing recruitment teams and high volumes of data. As your team grows, you can add users and adjust workflows. We keep investing in performance, features and usability, so Ditto keeps up as you scale.',
      },
    ],
  },
];
