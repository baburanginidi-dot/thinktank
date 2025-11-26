import { Framework } from "../types";

/**
 * An array of predefined frameworks for strategic planning, mental models, product development, and technical architecture.
 * Each framework includes an ID, name, category, description, relevance, layout type, and the steps involved.
 *
 * @type {Framework[]}
 */
export const LIBRARY_FRAMEWORKS: Framework[] = [
  // --- Strategic ---
  {
    id: "swot-analysis",
    name: "SWOT Analysis",
    category: "Strategic",
    description: "A strategic planning technique used to help a person or organization identify Strengths, Weaknesses, Opportunities, and Threats related to business competition or project planning.",
    relevance: "Best for evaluating a business venture or project by assessing internal and external factors.",
    layout: "matrix_2x2",
    steps: ["Strengths", "Weaknesses", "Opportunities", "Threats"]
  },
  {
    id: "eisenhower-matrix",
    name: "Eisenhower Matrix",
    category: "Strategic",
    description: "A productivity tool for organizing tasks by urgency and importance, helping you decide on and prioritize tasks by urgency and importance, sorting out less urgent and important tasks which you should either delegate or not do at all.",
    relevance: "Best for prioritization and time management when overwhelmed with tasks.",
    layout: "matrix_2x2",
    steps: ["Do First (Urgent & Important)", "Schedule (Less Urgent & Important)", "Delegate (Urgent & Less Important)", "Don't Do (Not Urgent & Not Important)"]
  },
  
  // --- Mental Model ---
  {
    id: "six-thinking-hats",
    name: "Six Thinking Hats",
    category: "Mental Model",
    description: "A system designed by Edward de Bono which describes a tool for group discussion and individual thinking involving six colored hats. 'Six Thinking Hats' provides a means for groups to think together more effectively, and a means to plan thinking processes in a detailed and cohesive way.",
    relevance: "Best for group brainstorming to explore problems from multiple distinct emotional and logical perspectives.",
    layout: "six_hats",
    steps: ["White Hat (Data)", "Red Hat (Emotions)", "Black Hat (Caution)", "Yellow Hat (Optimism)", "Green Hat (Creativity)", "Blue Hat (Process)"]
  },
  {
    id: "first-principles",
    name: "First Principles",
    category: "Mental Model",
    description: "A physics way of looking at the world. You boil things down to the most fundamental truths and say, 'What are we sure is true?' ... and then reason up from there.",
    relevance: "Best for innovation and solving complex problems where analogy-based reasoning fails.",
    layout: "linear",
    steps: ["Identify Assumptions", "Break Down to Basics", "Construct New Solutions"]
  },

  // --- Product ---
  {
    id: "jobs-to-be-done",
    name: "Jobs to be Done (JTBD)",
    category: "Product",
    description: "A theory of consumer action that describes the mechanisms that cause a consumer to adopt an innovation. The theory states that people buy products and services to get a 'job' done.",
    relevance: "Best for understanding customer motivation and defining product requirements.",
    layout: "linear",
    steps: ["Define the Core Job", "Identify Pain Points", "Identify Gains", "Create Value Proposition"]
  },
  {
    id: "double-diamond",
    name: "Double Diamond",
    category: "Product",
    description: "A design process model popularized by the British Design Council. It suggests that the design process should have four phases: Discover, Define, Develop and Deliver.",
    relevance: "Best for the end-to-end design process, ensuring the right problem is solved before solving it right.",
    layout: "linear",
    steps: ["Discover (Divergent)", "Define (Convergent)", "Develop (Divergent)", "Deliver (Convergent)"]
  },

  // --- Technical ---
  {
    id: "strangler-fig",
    name: "Strangler Fig Pattern",
    category: "Technical",
    description: "A way of migrating a legacy system by incrementally replacing specific pieces of functionality with new applications and services.",
    relevance: "Best for modernizing monolithic applications without a complete rewrite.",
    layout: "linear",
    steps: ["Identify Component", "Build New Service", "Route Traffic", "Decommission Legacy"]
  },
  {
    id: "cap-theorem",
    name: "CAP Theorem Analysis",
    category: "Technical",
    description: "States that it is impossible for a distributed data store to simultaneously provide more than two out of the following three guarantees: Consistency, Availability, and Partition tolerance.",
    relevance: "Best for making architectural decisions for distributed databases.",
    layout: "linear", // Could be a triangle layout in future, using linear for now
    steps: ["Assess Consistency Needs", "Assess Availability Needs", "Determine Partition Strategy", "Select Trade-off"]
  }
];