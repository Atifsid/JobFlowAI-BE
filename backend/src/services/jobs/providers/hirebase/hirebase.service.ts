import axios from "axios";
import { env } from "../../../../config/env";
import { JobSearch } from "../../../../models/job-search.model";
import { JobProvider, JobSearchResult } from "../../job-provider.types";
import { mapHireBaseJob } from "./hirebase.mapper";
import logger from "../../../../config/logger";

class HireBaseService implements JobProvider {
  private api = axios.create({
    baseURL: "https://api.hirebase.org/v2",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.HIREBASE_API_KEY
    }
  });

  async search(search: JobSearch): Promise<JobSearchResult> {
    const data = env.HIREBASE_USE_LIVE_API
      ? await this.fetchLiveJobs(search)
      : this.getStubJobs();

    const jobs = data.jobs.map(mapHireBaseJob);
    return { jobs, total: jobs.length };
  }

  private async fetchLiveJobs(search: JobSearch) {
    const { data } = await this.api.post("/jobs/search", {
      job_titles: [search.title],
      keywords: search.keywords,
      location_types: search.remote ? ["Remote"] : undefined,
      geo_locations: search.country
        ? [{ city: search.city, region: search.region, country: search.country }]
        : undefined,
      page: search.page ?? 1,
      limit: search.limit ?? 5,
      return_raw_description: "true",
      include_no_salary: "true"
    });

    logger.info(JSON.stringify(data));

    return data;
  }

  private getStubJobs() {
    return {
      "jobs": [
        {
          "_id": "6a2b4ffb03ba8a86df0cef16",
          "job_title": "Software Engineer III (Frontend Developer-React)",
          "description": "<h2>Role Overview</h2><p>We are seeking a talented and experienced React Native Developer to join our friendly and dynamic team. As an Australian product with a global presence, our developers are based in Europe and the Asia Pacific region. You will have the opportunity to work on a widely used product that’s trusted by thousands of real estate agents across Australia and New Zealand.</p><h2>What You Will Do</h2><p>You will collaborate with other engineers, product managers and testers to deliver high-quality mobile solutions that meet the needs of our users. You will work mainly on our mobile application using React Native, connecting to backend APIs and helping deliver a fast, reliable and easy-to-use experience for our customers.</p><h2>Why It Might Be a Fit</h2><p>If you’re passionate about mobile development and excited to work with a team of intelligent and skilled professionals, we encourage you to apply for this opportunity.</p><h2>Requirements</h2><ul><li>Over 5 years experience in software development</li><li>Strong experience with React Native</li><li>Modern JavaScript, preferably TypeScript</li><li>Experience working with REST APIs</li><li>Experience with mobile app authentication and session handling</li><li>Good understanding of mobile UI and UX patterns</li><li>Experience debugging mobile applications</li><li>Experience using Git and working in a team development environment</li></ul><h2>Benefits</h2><ul><li>Flexible to work in Rotational Shifts arrangements (Hybrid-3 days in the office)</li><li>Annual performance-related bonus</li><li>6x Flexi Anyday: knock 2.5 hours off your day on any day</li><li>Engaging, fun & inclusive culture</li></ul>",
          "application_link": "https://mrisoftware.wd501.myworkdayjobs.com/External_CareerSite/job/Bangalore-India-Office/Software-Engineer-III--Frontend-Developer-React-_R-108295",
          "location_raw": "Bangalore, India Office",
          "date_posted": "2026-06-11",
          "job_board": "workday",
          "job_board_link": "https://mrisoftware.wd501.myworkdayjobs.com/External_CareerSite",
          "platform_job_id": "R-108295",
          "description_raw": "<p><strong>Overview:</strong></p><p>Software Engineer III (Frontend Developer-React)</p><p>We are seeking a talented and experienced React Native Developer to join our friendly and dynamic team. As an Australian product with a global presence, our developers are based in Europe and the Asia Pacific region.</p><p>As part of your role, you will have the opportunity to work on a widely used product that’s trusted by thousands of real estate agents across Australia and New Zealand. You will collaborate with other engineers, product managers and testers to deliver high-quality mobile solutions that meet the needs of our users.</p><p>Our projects are well-documented by experienced product managers and designers, giving you clear requirements and expectations. You will work mainly on our mobile application using React Native, connecting to backend APIs and helping deliver a fast, reliable and easy-to-use experience for our customers.</p><p>The backend is managed by a separate engineering team, so Ruby on Rails experience is not required. You should be comfortable working with REST APIs, understanding API contracts, handling authentication, and building mobile features that integrate cleanly with backend services.</p><p>If you’re passionate about mobile development and excited to work with a team of intelligent and skilled professionals, we encourage you to apply for this opportunity.</p><p><strong>Required Skills:</strong></p><ul><li>Over 5 years experience in software development</li><li>Strong experience with React Native</li><li>Modern JavaScript, preferably TypeScript</li><li>Experience working with REST APIs</li><li>Experience with mobile app authentication and session handling</li><li>Good understanding of mobile UI and UX patterns</li><li>Experience debugging mobile applications</li><li>Experience using Git and working in a team development environment</li></ul><p><strong>Desirable Skills:</strong></p><ul><li>TypeScript</li><li>Native iOS or Android development experience</li><li>Experience with API-driven applications</li><li>Experience with push notifications</li><li>Experience with mobile app release processes, including App Store and Google Play</li><li>TDD or automated testing for mobile applications</li><li>React</li><li>Agile methodologies</li><li>AI coding tools</li><li>Passionate about programming</li></ul><p><strong>Education </strong></p><ul><li>Bachelor’s degree in Computer Science, IT, or related field</li></ul><p><strong>Benefits: </strong></p><ul><li>Flexible to work in Rotational Shifts arrangements (Hybrid-3 days in the office)</li><li>Annual performance-related bonus</li><li>6x Flexi Anyday: knock 2.5 hours off your day on any day</li><li>Engaging, fun &amp; inclusive culture: check out the MRI Software APAC Insta feed and stories!</li></ul><p><strong>About Us</strong></p> <p>From the day we opened our doors, MRI Software has built flexible, game-changing real estate software that powers thriving communities and helps make the world a better place to live, work and play. Fulfilling that mission is only possible because of one thing: exceptional people. People like you! </p> <p>Our people-first approach to PropTech is defining a new industry standard for client experiences that, quite frankly, can’t be duplicated. Experiences that deliver real value every day. And we know those experiences begin with our people. </p> <p>We believe MRI is more than just a workplace; it’s a connected community of people who truly feel they belong. Whether we’re investing in employee resource groups or providing tailored resources for each person to reach their full potential, we’re passionate about creating a work environment that makes you excited to show up every single day. </p> <p>At MRI, one of our core values is to <em>strive to amaze. </em> From the intelligent solutions we create to the culture we cultivate, that’s our goal every day. Because that’s what industry leaders do. Whether you’re joining as a new Pride member or rejoining us after a short time away, your talent is vital to us, our partners and our clients. </p> <p><strong>Amazing growth requires amazing employees. Are you up to the challenge? </strong> </p><p>We know confidence gap and imposter syndrome can get in the way of meeting remarkable candidates, so please don’t hesitate to apply. We’d love to hear from you! </p> <p><em>MRI is proud to be an inclusive employer. We welcome and celebrate diversity across all backgrounds, including ethnicity, religion, sexual orientation, gender identity, disability, age, military, veteran status and more.</em> </p><p><em>We believe that Belonging is a direct result of Diversity, Equity, and Inclusion. Those values are woven into the fabric of who we are and are foundational to our continued success. Come and see for yourself!</em> </p>",
          "company_name": "MRI Software",
          "company_slug": "mri-software-llc",
          "company_link": "mrisoftware.com",
          "company_logo": "https://logos.hirebase.org/dc15b168-d0c6-43f6-a307-8d6dabcd3fbc/mri-software-llc-320x320-q95.jpg",
          "language": "en",
          "benefits": [
            "Flexible to work in Rotational Shifts arrangements (Hybrid-3 days in the office)",
            "Annual performance-related bonus",
            "6x Flexi Anyday: knock 2.5 hours off your day on any day",
            "Engaging, fun & inclusive culture"
          ],
          "job_categories": [
            "Information Technology Jobs",
            "Software Engineer Jobs",
            "Engineering Jobs"
          ],
          "locations": [
            {
              "city": "Bengaluru",
              "region": "Karnataka",
              "country": "India",
              "coordinates": {
                "type": "Point",
                "coordinates": [
                  77.7101792,
                  12.9768724
                ]
              },
              "bbox": [
                12.9768224,
                12.9769224,
                77.7101292,
                77.7102292
              ],
              "address": "Graphite India, Kundalahalli Main Road, Channama Layout, Bengaluru East City Corporation, Bengaluru, Bangalore East, Bengaluru Urban, Karnataka, 560066, India"
            }
          ],
          "job_type": "Full Time",
          "location_type": "Hybrid",
          "education_level": "Bachelor's degree",
          "experience_level": "Junior / Associate",
          "yoe_range": {
            "min": 5,
            "max": 5
          },
          "visa_sponsored": false,
          "technologies": [
            "React Native",
            "React",
            "TypeScript",
            "JavaScript",
            "Ruby on Rails",
            "Git",
            "REST APIs"
          ],
          "skills": [
            "Mobile development",
            "UI and UX patterns",
            "API-driven applications",
            "Push notifications",
            "Mobile app release processes",
            "TDD or automated testing",
            "Agile methodologies",
            "AI coding tools"
          ],
          "team": "Friendly and dynamic team",
          "recruiter_agency": false,
          "offers_equity": true,
          "company_data": {
            "description_summary": "MRI Software delivers data-driven real estate solutions that empower property owners, managers, and investors to optimize operations and enhance community living. The company’s flagship offerings include integrated property management platforms for multifamily and commercial assets, investment-management tools, and advanced analytics that turn market data into actionable insights. By blending cutting-edge proptech with deep industry expertise, MRI helps clients reduce costs, improve tenant experience, and drive long-term value. A culture of innovation, collaboration, and continuous learning attracts talent eager to shape the future of real-estate technology.",
            "linkedin_link": "https://www.linkedin.com/company/mri-software-llc",
            "size_range": {
              "min": 1001,
              "max": 5000
            },
            "industries": [
              "Real Estate",
              "Tech, Software & IT Services"
            ],
            "subindustries": [
              "Real Estate Technology",
              "Data Management & Analytics"
            ],
            "services": [
              "Property Management Software",
              "Multifamily Real Estate",
              "Commercial Real Estate",
              "Investment Management",
              "Real Estate Software",
              "Proptech"
            ],
            "type": "Enterprise",
            "is_recruiting_agency": false,
            "is_3rd_party_agency": false
          },
          "job_title_raw": "Software Engineer III (Frontend Developer-React)",
          "md5_hash": "06b4c97e07630d202ff44ac139a05476",
          "job_slug": "software-engineer-iii-frontend-developer-react-09fcdda7",
          "flexibility_score": 4.3,
          "compensation_value_score": 5.5,
          "benefits_score": 4.1,
          "impact_autonomy_score": 6.1,
          "prestige_score": 5.9,
          "growth_score": 5.6,
          "coolness_score": 5.6,
          "equity": {
            "types": [],
            "amount_type": "unknown",
            "amount": null
          },
          "meta_completeness": false
        },
        {
          "_id": "6a3efbe5e6a825474beba6f2",
          "job_title": "Senior Lead Software Engineer - Frontend Developer",
          "description": "<h2>Role Overview</h2><p>We are seeking a Senior Lead Frontend Developer to join our Customers Identity & Access Management team at LSEG. You will play a pivotal role in maintaining and evolving our JavaScript SDK, a critical interface that enables secure authentication and seamless integration of our Authentication into client applications across to our customers.</p><h2>What You Will Do</h2><p>Own and maintain a JavaScript SDK built with React and TypeScript, enabling secure integration with our custom Secure Token Service. Design intuitive, developer-friendly APIs that abstract complex authentication flows (OAuth2, OpenID Connect). Ensure the SDK is secure, performant, and easy to integrate across a wide range of frontend applications.</p><h2>Why It Might Be a Fit</h2><p>Professional should have 10 – 15 years of total IT experience. Proven experience in frontend development, with deep expertise in React, TypeScript, and modern JavaScript. Strong understanding of OAuth2, OpenID Connect, and secure authentication flows.</p><h2>Requirements</h2><ul><li>10 – 15 years of total IT experience</li><li>Proven experience in frontend development</li><li>Deep expertise in React, TypeScript, and modern JavaScript</li><li>Strong understanding of OAuth2, OpenID Connect, and secure authentication flows</li></ul><h2>Benefits</h2><ul><li>Strong compensation package</li><li>Comprehensive benefits</li><li>Ongoing investment in career growth and skill development</li><li>Paid volunteering days</li><li>Wellbeing initiatives</li><li>Healthcare</li><li>Retirement planning</li></ul>",
          "application_link": "https://lseg.wd3.myworkdayjobs.com/Careers/job/IND-Bangalore-A-RMZ-Infinity/Lead-Software-Engineer_R0111468",
          "location_raw": "IND-Bangalore-A, RMZ Infinity",
          "date_posted": "2026-06-26",
          "job_board": "workday",
          "job_board_link": "https://lseg.wd3.myworkdayjobs.com/Careers",
          "platform_job_id": "R0111468",
          "description_raw": "<p>ROLE PROFILE:</p><p>We are seeking a Senior Lead Frontend Developer to join our Customers Identity &amp; Access Management team at LSEG. You will play a pivotal role in maintaining and evolving our JavaScript SDK, a critical interface that enables secure authentication and seamless integration of our Authentication into client applications across to our customers.</p><p>This role is ideal for someone who thrives in developer experience, SDK design, and security-focused frontend engineering.</p><p>What You’ll be doing:</p><ul><li> Own and maintain a JavaScript SDK built with React and TypeScript, enabling secure integration with our custom Secure Token Service. </li><li> Design intuitive, developer-friendly APIs that abstract complex authentication flows (OAuth2, OpenID Connect). </li><li> Ensure the SDK is secure, performant, and easy to integrate across a wide range of frontend applications. </li><li> Collaborate with backend engineers to align SDK functionality with evolving identity protocols and token flows. </li><li> Build automated tests and CI pipelines to ensure quality, reliability, and backward compatibility. </li><li> Write clear documentation and sample apps to support internal and external developers. </li><li> Stay current with frontend security best practices and contribute to platform-wide improvements. </li></ul><p>What You'll bring:</p><ul><li> Professional should have 10 – 15 years of total IT experience. </li><li>Proven of experience in frontend development, with deep expertise in React, TypeScript, and modern JavaScript.</li><li>Proven experience designing and maintaining SDKs or libraries used by other developers.</li><li>Strong understanding of OAuth2, OpenID Connect, and secure authentication flows.</li><li>Familiarity with CI/CD pipelines, automated testing, and versioning strategies for SDKs.</li><li>Experience with frontend performance optimization, cross-browser compatibility, and accessibility standards.</li><li>Passion for clean code, automation, and continuous improvement.</li><li>Excellent interpersonal skills and a passion for developer experience and security.</li></ul><p><strong>What you’ll get in return</strong></p><p><strong>High-impact projects</strong>: We work on a variety of pioneering AI products and leverage extensive datasets to solve complex, high-value challenges.</p><p><strong>Competitive benefits</strong>: You will enjoy a strong compensation package, comprehensive benefits, and ongoing investment in career growth and skill development.</p><p><strong>Industry leadership</strong>: This is an opportunity to be a founding member of the organization that’s delivering brand-new products that democratize modeling and analytics solutions.</p><p><strong>Collaborative environment</strong>: We provide opportunities for continuous learning and professional development in a work environment of dedicated, highly experienced teams.</p><p>We recognize that to attract the best talent, we need to be flexible, and we are open to discussing work arrangements with you. We take a hybrid approach to the workplace; this role is considered ‘Blended’, which requires attending the office at least three day per week while some teams and colleagues choose to collaborate in the office more frequently.</p><p>We're proud to have been recognised as a Great Place to Work® in India ‘25</p><p>Learn more about life and purpose of our company directly from India colleagues’ video: Bengaluru, India | Where We Work | LSEG</p><p><strong>Career Stage:</strong></p>Manager<p><strong>London Stock Exchange Group (LSEG) Information:</strong></p><p>Join us and be part of a team that values innovation, quality, and continuous improvement. If you're ready to take your career to the next level and make a significant impact, we'd love to hear from you.</p><p>LSEG is a leading global financial markets infrastructure and data provider. Our purpose is driving financial stability, empowering economies and enabling customers to create sustainable growth.</p><p>Our purpose is the foundation on which our culture is built. Our values of <strong>Integrity, Partnership</strong>, <strong>Excellence</strong> and <strong>Change</strong> underpin our purpose and set the standard for everything we do, every day. They go to the heart of who we are and guide our decision making and everyday actions.</p><p>Working with us means that you will be part of a dynamic organisation of 25,000 people across 65 countries. However, we will value your individuality and enable you to bring your true self to work so you can help enrich our diverse workforce.</p><p>We are proud to be an equal opportunities employer. This means that we do not discriminate on the basis of anyone’s race, religion, colour, national origin, gender, sexual orientation, gender identity, gender expression, age, marital status, veteran status, pregnancy or disability, or any other basis protected under applicable law. Conforming with applicable law, we can reasonably accommodate applicants' and employees' religious practices and beliefs, as well as mental health or physical disability needs.</p><p>You will be part of a collaborative and creative culture where we encourage new ideas. We are committed to sustainability across our global business and we are proud to partner with our customers to help them meet their sustainability objectives. Our charity, the LSEG Foundation provides charitable grants to community groups that help people access economic opportunities and build a secure future with financial independence. Colleagues can get involved through fundraising and volunteering.</p><p>LSEG offers a range of tailored benefits and support, including healthcare, retirement planning, paid volunteering days and wellbeing initiatives.</p><p>Please take a moment to read this privacy notice carefully, as it describes what personal information London Stock Exchange Group (LSEG) (we) may hold about you, what it’s used for, and how it’s obtained, your rights and how to contact us as a data subject. </p><p>If you are submitting as a Recruitment Agency Partner, it is essential and your responsibility to ensure that candidates applying to LSEG are aware of this privacy notice.</p>",
          "company_name": "LSEG Risk Intelligence",
          "company_slug": "lseg-risk",
          "company_link": "lseg.com",
          "company_logo": "https://logos.hirebase.org/8d3db2f5-08db-438a-893f-8b6c36476065/lseg-risk-320x320-q95.jpg",
          "language": "en",
          "benefits": [
            "Strong compensation package",
            "Comprehensive benefits",
            "Ongoing investment in career growth and skill development",
            "Paid volunteering days",
            "Wellbeing initiatives",
            "Healthcare",
            "Retirement planning"
          ],
          "job_categories": [
            "Engineering Jobs",
            "Information Technology Jobs",
            "Software Engineer Jobs"
          ],
          "locations": [
            {
              "city": "Bengaluru",
              "region": "Karnataka",
              "country": "India",
              "coordinates": {
                "type": "Point",
                "coordinates": [
                  77.590082,
                  12.9767936
                ]
              },
              "bbox": [
                12.8334905,
                13.1426196,
                77.4598797,
                77.7840639
              ],
              "address": "Bengaluru, Bangalore North, Bengaluru Urban, Karnataka, India"
            }
          ],
          "job_type": "Full Time",
          "location_type": "Hybrid",
          "experience_level": "Principal / Staff / Lead",
          "yoe_range": {
            "min": 10,
            "max": 15
          },
          "visa_sponsored": false,
          "technologies": [
            "React",
            "TypeScript",
            "JavaScript",
            "OAuth2",
            "OpenID Connect"
          ],
          "skills": [
            "Frontend development",
            "SDK design",
            "Security-focused frontend engineering"
          ],
          "team": "Customers Identity & Access Management",
          "recruiter_agency": false,
          "offers_equity": false,
          "company_data": {
            "description_summary": "LSEG Risk Intelligence delivers a comprehensive suite of risk, compliance, and fraud‑management solutions to financial institutions worldwide. Leveraging advanced data, technology, and research, the business helps clients meet regulatory requirements—including AML, KYC, sanctions screening, and third‑party risk—while streamlining vendor management and audit processes.\n\nServing over 40,000 institutions across 190 markets, LSEG Risk Intelligence enables firms to reduce operational costs, accelerate client onboarding, and enhance customer experiences. Backed by a heritage of integrity and a global presence in more than 70 countries, the company positions itself as a trusted partner for sustainable growth and informed decision‑making.",
            "linkedin_link": "https://www.linkedin.com/company/lseg-risk",
            "size_range": {
              "min": 10001,
              "max": null
            },
            "industries": [
              "Finance",
              "Tech, Software & IT Services"
            ],
            "subindustries": [
              "Finance Risk Management",
              "Fintech",
              "Legal & Compliance Technology",
              "Data Management & Analytics",
              "Cybersecurity"
            ],
            "services": [
              "Regulatory Compliance",
              "AML",
              "KYC",
              "Client Screening",
              "Sanctions and Enforcements",
              "E-learning",
              "Compliance Recruitment",
              "Regtech",
              "Financial Regulation",
              "Mifid Ii",
              "Third Party Risk",
              "Supply Chain Risk",
              "Culture of Compliance",
              "Audit",
              "Risk Management"
            ],
            "type": "Enterprise",
            "is_recruiting_agency": false,
            "is_3rd_party_agency": false
          },
          "job_title_raw": "Senior Lead Software Engineer - Frontend Developer",
          "md5_hash": "6256ee71800098465031aa23a6e23c34",
          "job_slug": "senior-lead-software-engineer-frontend-developer-79ad77be",
          "flexibility_score": 6.1,
          "compensation_value_score": 7.3,
          "benefits_score": 6.8,
          "impact_autonomy_score": 8,
          "prestige_score": 6.8,
          "growth_score": 7.1,
          "coolness_score": 7.5,
          "meta_completeness": false
        },
        {
          "_id": "69d0bf7b11616c0994f8ffad",
          "company_name": "Hudson Hospital",
          "job_title": "Software Engineer – Frontend & Developer Experience",
          "application_link": "https://fa-etnv-saasfaprod1.fa.ocs.oraclecloud.com/hcmUI/CandidateExperience/en/sites/hudson-hospital/job/118689",
          "location_raw": "Bloomington, MN, United States",
          "job_type": "Full Time",
          "location_type": "Hybrid",
          "date_posted": "2026-04-03",
          "company_link": "www.hudsonhospital.org",
          "company_logo": "https://media.licdn.com/dms/image/v2/C4E0BAQEAFbjaY9lpRA/company-logo_200_200/company-logo_200_200/0/1630637563854?e=2147483647&v=beta&t=ioizP96yMzctXnjFKlVWeZecMmZp9t9dKTQ76yyH2kA",
          "job_board": "oraclecloud",
          "job_board_link": "https://fa-etnv-saasfaprod1.fa.ocs.oraclecloud.com/hcmUI/CandidateExperience/en/sites/hudson-hospital",
          "language": "en",
          "description_raw": "<h2>Job Description</h2><p>HealthPartners is currently hiring a <strong>Software Engineer – Frontend &amp; Developer Experience</strong>. This role supports the modernization of Health Plan administrative and claims user interfaces. The engineer is responsible for building clear, consistent, and high performing user experiences using modern frontend technologies, while partnering closely with backend and IRIS platform teams. This engineer will also contribute to improving developer productivity through better tooling, testing practices, and documentation.</p><p>In addition to core software development responsibilities, this role supports the integration of AI‐assisted tools into enterprise development workflows. The focus is on applying AI within established prompts, guardrails, and human‐in‐the‐loop validation to enhance development efficiency and understanding of complex systems, while maintaining strong engineering judgment and hands‐on development practices.</p><p>The ideal candidate understands that healthcare frontend systems must be reliable, intuitive, and intentionally thin, with business logic residing in backend services. They enjoy working at the intersection of modern and legacy systems and recognize that effective modernization is incremental rather than a full rewrite. </p><p>This is a newly created role reporting to the Director of Healthplan Administrative Systems. The position is part of a fifty-three-three-person department and will be one of fifteen direct reports, working alongside Developers, Engineers, Scrum Masters, and Managers.</p><p><strong>Required Qualifications:</strong></p><ul><li>Bachelor’s degree in Computer Science, MIS, Business Administration, or equivalent experience.</li><li>Three (3) years of experience developing modern web applications.</li><li>Strong experience with React (PrimeReact preferred); AngularJS experience is also acceptable.</li><li>Experience consuming REST APIs and working with backend teams.</li><li>Experience using AI-assisted development tools (e.g., Claude Code, GitHub Copilot, or similar) to improve developer productivity, code quality, or documentation. </li><li>Understanding front-end performance, accessibility, and usability.</li><li>Ability to work in a complex, regulated enterprise environment.</li><li>Willingness and ability to learn healthcare workflows and backend system constraints.</li></ul><p><strong>Preferred Qualifications:</strong></p><ul><li>Four or more (4) + years of experience developing modern web applications.</li><li>Experience with PrimeReact, Redux, or similar libraries.</li><li>Experience working with Java/Spring Boot or other backend platforms.</li><li>Experience designing or using agentic AI workflows (e.g., AI agents for code generation, refactoring assistance, test creation, or knowledge extraction from legacy systems).</li><li>Familiarity with integrating AI tools into enterprise development workflows, including prompt engineering, guardrails, and human‐in‐the‐loop validation.</li><li>Familiarity with healthcare or insurance applications.</li><li>Experience improving developer experience (testing, tooling, documentation).</li><li>Experience using AI assisted tools for UI scaffolding, test generation, and documentation.</li></ul><p><strong>Hours/Location:</strong></p><ul><li>M-F; core business hours</li><li>This is a hybrid position with the flexibility to work primarily remotely, with occasional onsite presence required for meetings or workgroup sessions. </li><li>The role participates in an on-call rotation shared across the team, averaging approximately 2–4 weeks per year.</li></ul><p><strong>Responsibilities:</strong></p><ul><li>Design and develop user interfaces for Claims and Health Plan applications.</li><li>Ensure frontend implementations follow established architectural patterns and boundaries.</li><li>Partner with backend teams to deliver cohesive end-to-end functionality.</li><li>Implement unit and integration tests for UI components.</li><li>Help standardize frontend patterns and improve developer productivity.</li><li>Participate in troubleshooting and production support as needed.</li></ul><h2>About us</h2><p>At HealthPartners we believe in the power of good – good deeds and good people working together. As part of our team, you’ll find an inclusive environment that encourages new ways of thinking, celebrates differences, and recognizes hard work.</p> <p>We’re a nonprofit, integrated health care organization, providing health insurance in six states and high-quality care at more than 90 locations, including hospitals and clinics in Minnesota and Wisconsin. We bring together research and education through HealthPartners Institute, training medical professionals across the region and conducting innovative research that improve lives around the world.</p> <p>At HealthPartners, everyone is welcome, included and valued. We’re working together to increase diversity and inclusion in our workplace, advance health equity in care and coverage, and partner with the community as advocates for change.</p> <p><strong>Benefits Designed to Support Your Total Health<br></strong>As a HealthPartners colleague, we’re committed to nurturing your diverse talents, valuing your dedication, and supporting your work-life balance. We offer a comprehensive range of benefits to support every aspect of your life, including health, time off, retirement planning, and continuous learning opportunities. Our goal is to help you thrive physically, mentally, emotionally, and financially, so you can continue delivering exceptional care.</p> <p>Join us in our mission to improve the health and well-being of our patients, members, and communities.</p> <p>We are an Equal Opportunity Employer and do not discriminate against any employee or applicant because of race, color, sex, age, national origin, religion, sexual orientation, gender identify, status as a veteran and basis of disability or any other federal, state or local protected class.</p>",
          "description": "<p>HealthPartners is hiring a Software Engineer – Frontend & Developer Experience to modernize user interfaces and improve developer productivity. The role supports the integration of AI-assisted tools and requires experience with React, REST APIs, and backend teams.</p><h2>Requirements</h2><ul><li>Bachelor's degree in Computer Science, MIS, Business Administration, or equivalent experience.</li><li>Three (3) years of experience developing modern web applications.</li><li>Strong experience with React (PrimeReact preferred); AngularJS experience is also acceptable.</li><li>Experience consuming REST APIs and working with backend teams.</li><li>Experience using AI-assisted development tools (e.g., Claude Code, GitHub Copilot, or similar) to improve developer productivity, code quality, or documentation.</li></ul><h2>Benefits</h2><ul><li>Generous Paid Time Off</li><li>401k Matching</li><li>Retirement Plan</li><li>Tuition Reimbursement</li></ul>",
          "requirements_summary": "Bachelor's degree in Computer Science, MIS, or Business Administration, and 3 years of experience developing modern web applications",
          "job_categories": [
            "Information Technology Jobs",
            "Software Engineer Jobs",
            "Healthcare Services Jobs"
          ],
          "locations": [
            {
              "city": null,
              "region": "Minnesota",
              "country": "United States",
              "coordinates": {
                "type": "Point",
                "coordinates": [
                  -93.3204872,
                  44.8322405
                ]
              },
              "bbox": [
                44.7851309,
                44.8631417,
                -93.3988956,
                -93.197413
              ],
              "address": "Bloomington, Hennepin County, Minnesota, United States"
            }
          ],
          "education_level": "Bachelor's degree",
          "yoe_range": {
            "min": 3,
            "max": 4
          },
          "visa_sponsored": false,
          "technologies": [
            "React",
            "PrimeReact",
            "REST APIs",
            "Java/Spring Boot",
            "Agentic AI workflows"
          ],
          "skills": [
            "Front-end performance",
            "Accessibility",
            "Usability",
            "AI-assisted development tools"
          ],
          "recruiter_agency": false,
          "company_data": {
            "description_summary": "HealthPartners is a nonprofit, integrated health care organization providing health insurance in six states and high-quality care at more than 90 locations.",
            "linkedin_link": "https://www.linkedin.com/company/hudson-hospital-&-clinics",
            "size_range": {
              "min": 201,
              "max": 500
            },
            "industries": [
              "Healthcare"
            ],
            "subindustries": [
              "Hospitals"
            ],
            "services": [
              "Adult and Pediatric Cancer Care",
              "Alohol and Substance Abuse Recovery",
              "Birth Center",
              "Emergency Center",
              "Heart Care",
              "Hospital Care",
              "Imaging Center",
              "Internal Medicine",
              "Inpatient Care",
              "Lab",
              "Pharmacy",
              "Rehab Center",
              "Specialty Clinics",
              "Surgery and Procedure Center",
              "Healing Arts"
            ]
          },
          "company_slug": "hudson-hospital",
          "job_slug": "software-engineer-frontend-developer-experience-31d16817",
          "experience_level": "Junior / Associate",
          "flexibility_score": 5.8,
          "compensation_value_score": 6.9,
          "benefits_score": 6.6,
          "impact_autonomy_score": 7.6,
          "prestige_score": 6.7,
          "growth_score": 6.8,
          "coolness_score": 7.2,
          "meta_completeness": false
        },
        {
          "_id": "69d0bc2911616c0994f8f874",
          "company_name": "HealthPartners",
          "job_title": "Software Engineer – Frontend & Developer Experience",
          "application_link": "https://fa-etnv-saasfaprod1.fa.ocs.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1/job/118689",
          "location_raw": "Bloomington, MN, United States",
          "job_type": "Full Time",
          "location_type": "Hybrid",
          "date_posted": "2026-04-03",
          "company_link": null,
          "company_logo": "https://www.healthpartners.com/content/dam/brand-identity/logos/internal/healthpartners-park-nicollet/hp/hp-1line-h/hp-1h-rgb.svg",
          "job_board": "oraclecloud",
          "job_board_link": "https://fa-etnv-saasfaprod1.fa.ocs.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1",
          "language": "en",
          "description_raw": "<h2>Job Description</h2><p>HealthPartners is currently hiring a <strong>Software Engineer – Frontend &amp; Developer Experience</strong>. This role supports the modernization of Health Plan administrative and claims user interfaces. The engineer is responsible for building clear, consistent, and high performing user experiences using modern frontend technologies, while partnering closely with backend and IRIS platform teams. This engineer will also contribute to improving developer productivity through better tooling, testing practices, and documentation.</p><p>In addition to core software development responsibilities, this role supports the integration of AI‐assisted tools into enterprise development workflows. The focus is on applying AI within established prompts, guardrails, and human‐in‐the‐loop validation to enhance development efficiency and understanding of complex systems, while maintaining strong engineering judgment and hands‐on development practices.</p><p>The ideal candidate understands that healthcare frontend systems must be reliable, intuitive, and intentionally thin, with business logic residing in backend services. They enjoy working at the intersection of modern and legacy systems and recognize that effective modernization is incremental rather than a full rewrite. </p><p>This is a newly created role reporting to the Director of Healthplan Administrative Systems. The position is part of a fifty-three-three-person department and will be one of fifteen direct reports, working alongside Developers, Engineers, Scrum Masters, and Managers.</p><p><strong>Required Qualifications:</strong></p><ul><li>Bachelor’s degree in Computer Science, MIS, Business Administration, or equivalent experience.</li><li>Three (3) years of experience developing modern web applications.</li><li>Strong experience with React (PrimeReact preferred); AngularJS experience is also acceptable.</li><li>Experience consuming REST APIs and working with backend teams.</li><li>Experience using AI-assisted development tools (e.g., Claude Code, GitHub Copilot, or similar) to improve developer productivity, code quality, or documentation. </li><li>Understanding front-end performance, accessibility, and usability.</li><li>Ability to work in a complex, regulated enterprise environment.</li><li>Willingness and ability to learn healthcare workflows and backend system constraints.</li></ul><p><strong>Preferred Qualifications:</strong></p><ul><li>Four or more (4) + years of experience developing modern web applications.</li><li>Experience with PrimeReact, Redux, or similar libraries.</li><li>Experience working with Java/Spring Boot or other backend platforms.</li><li>Experience designing or using agentic AI workflows (e.g., AI agents for code generation, refactoring assistance, test creation, or knowledge extraction from legacy systems).</li><li>Familiarity with integrating AI tools into enterprise development workflows, including prompt engineering, guardrails, and human‐in‐the‐loop validation.</li><li>Familiarity with healthcare or insurance applications.</li><li>Experience improving developer experience (testing, tooling, documentation).</li><li>Experience using AI assisted tools for UI scaffolding, test generation, and documentation.</li></ul><p><strong>Hours/Location:</strong></p><ul><li>M-F; core business hours</li><li>This is a hybrid position with the flexibility to work primarily remotely, with occasional onsite presence required for meetings or workgroup sessions. </li><li>The role participates in an on-call rotation shared across the team, averaging approximately 2–4 weeks per year.</li></ul><p><strong>Responsibilities:</strong></p><ul><li>Design and develop user interfaces for Claims and Health Plan applications.</li><li>Ensure frontend implementations follow established architectural patterns and boundaries.</li><li>Partner with backend teams to deliver cohesive end-to-end functionality.</li><li>Implement unit and integration tests for UI components.</li><li>Help standardize frontend patterns and improve developer productivity.</li><li>Participate in troubleshooting and production support as needed.</li></ul><h2>About us</h2><p>At HealthPartners we believe in the power of good – good deeds and good people working together. As part of our team, you’ll find an inclusive environment that encourages new ways of thinking, celebrates differences, and recognizes hard work.</p> <p>We’re a nonprofit, integrated health care organization, providing health insurance in six states and high-quality care at more than 90 locations, including hospitals and clinics in Minnesota and Wisconsin. We bring together research and education through HealthPartners Institute, training medical professionals across the region and conducting innovative research that improve lives around the world.</p> <p>At HealthPartners, everyone is welcome, included and valued. We’re working together to increase diversity and inclusion in our workplace, advance health equity in care and coverage, and partner with the community as advocates for change.</p> <p><strong>Benefits Designed to Support Your Total Health<br></strong>As a HealthPartners colleague, we’re committed to nurturing your diverse talents, valuing your dedication, and supporting your work-life balance. We offer a comprehensive range of benefits to support every aspect of your life, including health, time off, retirement planning, and continuous learning opportunities. Our goal is to help you thrive physically, mentally, emotionally, and financially, so you can continue delivering exceptional care.</p> <p>Join us in our mission to improve the health and well-being of our patients, members, and communities.</p> <p>We are an Equal Opportunity Employer and do not discriminate against any employee or applicant because of race, color, sex, age, national origin, religion, sexual orientation, gender identify, status as a veteran and basis of disability or any other federal, state or local protected class.</p>",
          "description": "<p>HealthPartners is hiring a Software Engineer – Frontend & Developer Experience to support the modernization of Health Plan administrative and claims user interfaces. The engineer will design and develop user interfaces, partner with backend teams, and contribute to improving developer productivity.</p><h2>Requirements</h2><ul><li>Bachelor's degree in Computer Science, MIS, Business Administration, or equivalent experience</li><li>Three (3) years of experience developing modern web applications</li><li>Strong experience with React (PrimeReact preferred); AngularJS experience is also acceptable</li><li>Experience consuming REST APIs and working with backend teams</li><li>Experience using AI-assisted development tools to improve developer productivity, code quality, or documentation</li><li>Understanding front-end performance, accessibility, and usability</li><li>Ability to work in a complex, regulated enterprise environment</li><li>Willingness and ability to learn healthcare workflows and backend system constraints</li></ul><h2>Benefits</h2><ul><li>Comprehensive range of benefits to support every aspect of life, including health, time off, retirement planning, and continuous learning opportunities</li></ul>",
          "requirements_summary": "Bachelor's degree, 3+ years of experience developing modern web applications, strong React skills",
          "job_categories": [
            "Software Engineer Jobs",
            "Information Technology Jobs"
          ],
          "locations": [
            {
              "city": null,
              "region": "Minnesota",
              "country": "United States",
              "coordinates": {
                "type": "Point",
                "coordinates": [
                  -93.3204872,
                  44.8322405
                ]
              },
              "bbox": [
                44.7851309,
                44.8631417,
                -93.3988956,
                -93.197413
              ],
              "address": "Bloomington, Hennepin County, Minnesota, United States"
            }
          ],
          "education_level": "Bachelor's degree",
          "yoe_range": {
            "min": 3,
            "max": 4
          },
          "visa_sponsored": false,
          "technologies": [
            "React",
            "PrimeReact",
            "Redux",
            "Java/Spring Boot",
            "REST APIs",
            "AI-assisted development tools"
          ],
          "skills": [
            "front-end performance",
            "accessibility",
            "usability",
            "developer productivity",
            "healthcare workflows"
          ],
          "team": "HealthPartners",
          "recruiter_agency": false,
          "company_data": {
            "description_summary": "HealthPartners is a nonprofit, integrated health care organization providing health insurance and high-quality care in six states.",
            "linkedin_link": "https://www.linkedin.com/company/healthpartners",
            "size_range": {
              "min": 10001,
              "max": null
            },
            "industries": [
              "Healthcare"
            ],
            "subindustries": [
              "Other"
            ],
            "services": null
          },
          "company_slug": "healthpartners",
          "job_slug": "software-engineer-frontend-developer-experience-5b48f65d",
          "experience_level": "Junior / Associate",
          "flexibility_score": 6.2,
          "compensation_value_score": 7.3,
          "benefits_score": 7.3,
          "impact_autonomy_score": 7.9,
          "prestige_score": 6.9,
          "growth_score": 7.1,
          "coolness_score": 7.5,
          "meta_completeness": false
        },
        {
          "_id": "69d0bc7d11616c0994f8f969",
          "company_name": "Park Nicollet",
          "job_title": "Software Engineer – Frontend & Developer Experience",
          "application_link": "https://fa-etnv-saasfaprod1.fa.ocs.oraclecloud.com/hcmUI/CandidateExperience/en/sites/park-nicollet/job/118689",
          "location_raw": "Bloomington, MN, United States",
          "job_type": "Full Time",
          "location_type": "Hybrid",
          "date_posted": "2026-04-03",
          "company_link": "www.parknicollet.com",
          "company_logo": "https://media.licdn.com/dms/image/v2/C4E0BAQGrDdFtZmWmUA/company-logo_200_200/company-logo_200_200/0/1630620366215?e=2147483647&v=beta&t=Mlwg0Y6974aJjV-oWwWC9cz1TFaqTFxTGHHcBT1ipHY",
          "job_board": "oraclecloud",
          "job_board_link": "https://fa-etnv-saasfaprod1.fa.ocs.oraclecloud.com/hcmUI/CandidateExperience/en/sites/park-nicollet",
          "language": "en",
          "description_raw": "<h2>Job Description</h2><p>HealthPartners is currently hiring a <strong>Software Engineer – Frontend &amp; Developer Experience</strong>. This role supports the modernization of Health Plan administrative and claims user interfaces. The engineer is responsible for building clear, consistent, and high performing user experiences using modern frontend technologies, while partnering closely with backend and IRIS platform teams. This engineer will also contribute to improving developer productivity through better tooling, testing practices, and documentation.</p><p>In addition to core software development responsibilities, this role supports the integration of AI‐assisted tools into enterprise development workflows. The focus is on applying AI within established prompts, guardrails, and human‐in‐the‐loop validation to enhance development efficiency and understanding of complex systems, while maintaining strong engineering judgment and hands‐on development practices.</p><p>The ideal candidate understands that healthcare frontend systems must be reliable, intuitive, and intentionally thin, with business logic residing in backend services. They enjoy working at the intersection of modern and legacy systems and recognize that effective modernization is incremental rather than a full rewrite. </p><p>This is a newly created role reporting to the Director of Healthplan Administrative Systems. The position is part of a fifty-three-three-person department and will be one of fifteen direct reports, working alongside Developers, Engineers, Scrum Masters, and Managers.</p><p><strong>Required Qualifications:</strong></p><ul><li>Bachelor’s degree in Computer Science, MIS, Business Administration, or equivalent experience.</li><li>Three (3) years of experience developing modern web applications.</li><li>Strong experience with React (PrimeReact preferred); AngularJS experience is also acceptable.</li><li>Experience consuming REST APIs and working with backend teams.</li><li>Experience using AI-assisted development tools (e.g., Claude Code, GitHub Copilot, or similar) to improve developer productivity, code quality, or documentation. </li><li>Understanding front-end performance, accessibility, and usability.</li><li>Ability to work in a complex, regulated enterprise environment.</li><li>Willingness and ability to learn healthcare workflows and backend system constraints.</li></ul><p><strong>Preferred Qualifications:</strong></p><ul><li>Four or more (4) + years of experience developing modern web applications.</li><li>Experience with PrimeReact, Redux, or similar libraries.</li><li>Experience working with Java/Spring Boot or other backend platforms.</li><li>Experience designing or using agentic AI workflows (e.g., AI agents for code generation, refactoring assistance, test creation, or knowledge extraction from legacy systems).</li><li>Familiarity with integrating AI tools into enterprise development workflows, including prompt engineering, guardrails, and human‐in‐the‐loop validation.</li><li>Familiarity with healthcare or insurance applications.</li><li>Experience improving developer experience (testing, tooling, documentation).</li><li>Experience using AI assisted tools for UI scaffolding, test generation, and documentation.</li></ul><p><strong>Hours/Location:</strong></p><ul><li>M-F; core business hours</li><li>This is a hybrid position with the flexibility to work primarily remotely, with occasional onsite presence required for meetings or workgroup sessions. </li><li>The role participates in an on-call rotation shared across the team, averaging approximately 2–4 weeks per year.</li></ul><p><strong>Responsibilities:</strong></p><ul><li>Design and develop user interfaces for Claims and Health Plan applications.</li><li>Ensure frontend implementations follow established architectural patterns and boundaries.</li><li>Partner with backend teams to deliver cohesive end-to-end functionality.</li><li>Implement unit and integration tests for UI components.</li><li>Help standardize frontend patterns and improve developer productivity.</li><li>Participate in troubleshooting and production support as needed.</li></ul><h2>About us</h2><p>At HealthPartners we believe in the power of good – good deeds and good people working together. As part of our team, you’ll find an inclusive environment that encourages new ways of thinking, celebrates differences, and recognizes hard work.</p> <p>We’re a nonprofit, integrated health care organization, providing health insurance in six states and high-quality care at more than 90 locations, including hospitals and clinics in Minnesota and Wisconsin. We bring together research and education through HealthPartners Institute, training medical professionals across the region and conducting innovative research that improve lives around the world.</p> <p>At HealthPartners, everyone is welcome, included and valued. We’re working together to increase diversity and inclusion in our workplace, advance health equity in care and coverage, and partner with the community as advocates for change.</p> <p><strong>Benefits Designed to Support Your Total Health<br></strong>As a HealthPartners colleague, we’re committed to nurturing your diverse talents, valuing your dedication, and supporting your work-life balance. We offer a comprehensive range of benefits to support every aspect of your life, including health, time off, retirement planning, and continuous learning opportunities. Our goal is to help you thrive physically, mentally, emotionally, and financially, so you can continue delivering exceptional care.</p> <p>Join us in our mission to improve the health and well-being of our patients, members, and communities.</p> <p>We are an Equal Opportunity Employer and do not discriminate against any employee or applicant because of race, color, sex, age, national origin, religion, sexual orientation, gender identify, status as a veteran and basis of disability or any other federal, state or local protected class.</p>",
          "description": "<p>HealthPartners is hiring a Software Engineer – Frontend & Developer Experience to modernize user interfaces for administrative and claims user interfaces, and contribute to improving developer productivity through better tooling, testing practices, and documentation. The engineer will also support the integration of AI-assisted tools into enterprise development workflows.</p><h2>Requirements</h2><ul><li>Bachelor's degree in Computer Science, MIS, Business Administration, or equivalent experience</li><li>Three years of experience developing modern web applications</li><li>Strong experience with React (PrimeReact preferred); AngularJS experience is also acceptable</li><li>Experience consuming REST APIs and working with backend teams</li><li>Experience using AI-assisted development tools (e.g., Claude Code, GitHub Copilot, or similar)</li><li>Understanding front-end performance, accessibility, and usability</li><li>Ability to work in a complex, regulated enterprise environment</li><li>Willingness and ability to learn healthcare workflows and backend system constraints</li></ul><h2>Benefits</h2><ul><li>Comprehensive range of benefits to support every aspect of life</li><li>Health, time off, retirement planning, and continuous learning opportunities</li><li>Supports physical, mental, emotional, and financial well-being</li></ul>",
          "requirements_summary": "3+ years of experience in web development, Bachelor's degree in CS or related field, experience with React and AI-assisted tools",
          "job_categories": [
            "Software Engineer Jobs",
            "Information Technology Jobs"
          ],
          "locations": [
            {
              "city": null,
              "region": "Minnesota",
              "country": "United States",
              "coordinates": {
                "type": "Point",
                "coordinates": [
                  -93.3204872,
                  44.8322405
                ]
              },
              "bbox": [
                44.7851309,
                44.8631417,
                -93.3988956,
                -93.197413
              ],
              "address": "Bloomington, Hennepin County, Minnesota, United States"
            }
          ],
          "education_level": "Bachelor's degree",
          "yoe_range": {
            "min": 3,
            "max": 4
          },
          "visa_sponsored": false,
          "technologies": [
            "React",
            "AngularJS",
            "PrimeReact",
            "REST APIs",
            "Java/Spring Boot",
            "Redux",
            "AI-assisted tools"
          ],
          "skills": [
            "Front-end performance",
            "Accessibility",
            "Usability",
            "Complex, regulated enterprise environment"
          ],
          "recruiter_agency": false,
          "company_data": {
            "description_summary": "HealthPartners is a nonprofit, integrated health care organization providing health insurance and high-quality care in six states.",
            "linkedin_link": "https://www.linkedin.com/company/park-nicollet-health-services",
            "size_range": {
              "min": 5001,
              "max": 10000
            },
            "industries": [
              "Healthcare"
            ],
            "subindustries": [
              "Hospitals",
              "Medical Practices"
            ],
            "services": [
              "Eating Disorders (melrose Institute)",
              "Heart and Vascular (heart and Vascular Center)",
              "Diabetes (international Diabetes Center)",
              "Cancer (frauenshuh Cancer Center)"
            ]
          },
          "company_slug": "park-nicollet",
          "job_slug": "software-engineer-frontend-developer-experience-6005c53f",
          "experience_level": "Junior / Associate",
          "flexibility_score": 5.9,
          "compensation_value_score": 6.8,
          "benefits_score": 6.7,
          "impact_autonomy_score": 7.5,
          "prestige_score": 6.2,
          "growth_score": 6.8,
          "coolness_score": 6.9,
          "meta_completeness": false
        }
      ],
      "total_count": 12,
      "company_count": 10,
      "page": 1,
      "limit": 5,
      "total_pages": 3
    };
  }
}

export default new HireBaseService();