export const genId = () => {
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'AGR-';
  for (let i = 0; i < 8; i++) id += c[Math.floor(Math.random() * c.length)];
  return id;
};

export const TEMPLATES = {
  electronics: { areaOfWork: 'Electronics & Embedded Systems', projectTitle: 'Collision Detection Device', projectDesc: 'Design and development of an embedded collision detection device using IR and ultrasonic sensors interfaced with an ESP32 microcontroller.', components: 'IR Sensor, Ultrasonic Sensor, ESP32, PCB Board, Power Module', totalCost: '4500', advancePct: '50', gstPct: '18', timeline: '21', revisions: '2', warranty: '30 days from delivery', scope: ['Circuit schematic design and component selection', 'Firmware programming on ESP32', 'PCB layout and fabrication coordination', 'Field testing and calibration', 'Delivery with documentation'] },
  software: { areaOfWork: 'Software Development', projectTitle: 'Custom Web Application', projectDesc: 'Full-stack web application development including frontend UI, REST API backend, database integration, and cloud deployment.', components: 'React.js, Node.js, PostgreSQL, Docker, AWS', totalCost: '25000', advancePct: '40', gstPct: '18', timeline: '45', revisions: '3', warranty: '60 days post-launch', scope: ['Requirements analysis and system architecture', 'Frontend development (React)', 'Backend API (Node.js/Express)', 'Database design and integration', 'Testing, QA, and deployment'] },
  ai: { areaOfWork: 'Artificial Intelligence / ML', projectTitle: 'Custom ML Model Development', projectDesc: 'Development and training of a machine learning model for image classification, including preprocessing, training, evaluation, and API deployment.', components: 'Python, TensorFlow, PyTorch, FastAPI, Docker', totalCost: '35000', advancePct: '50', gstPct: '18', timeline: '30', revisions: '2', warranty: '45 days model performance guarantee', scope: ['Dataset collection and preprocessing', 'Model architecture selection and training', 'Performance evaluation and optimization', 'REST API wrapping and deployment', 'Documentation and model card'] },
  iot: { areaOfWork: 'IoT & Automation', projectTitle: 'Smart Automation System', projectDesc: 'End-to-end IoT automation with sensor nodes, MQTT communication, cloud dashboard, and mobile control interface.', components: 'ESP8266, MQTT Broker, Node-RED, InfluxDB, Grafana', totalCost: '12000', advancePct: '50', gstPct: '18', timeline: '30', revisions: '2', warranty: '60 days', scope: ['Hardware node design and programming', 'MQTT broker setup', 'Dashboard development (Node-RED/Grafana)', 'Mobile app integration', 'Testing and documentation'] },
  design: { areaOfWork: 'Design & Creative', projectTitle: 'Brand Identity Design', projectDesc: 'Complete brand identity package including logo design, typography, color palette, and brand guidelines.', components: 'Figma, Adobe Illustrator, Adobe Photoshop', totalCost: '8000', advancePct: '30', gstPct: '18', timeline: '14', revisions: '3', warranty: 'Not applicable', scope: ['Brand discovery and mood board', 'Logo concepts (3 variations)', 'Typography and color selection', 'Brand guidelines PDF', 'Final file delivery (AI, SVG, PNG, PDF)'] },
  consulting: { areaOfWork: 'Consulting', projectTitle: 'Technical Architecture Consulting', projectDesc: 'Technical consulting including system architecture review, recommendations report, and implementation roadmap.', components: 'Documentation tools, Diagramming software', totalCost: '15000', advancePct: '100', gstPct: '18', timeline: '10', revisions: '1', warranty: 'Not applicable', scope: ['Discovery and requirements gathering', 'Architecture review', 'Recommendations report', 'Implementation roadmap', 'Follow-up consultation call'] }
};

export const INITIAL_FORM_DATA = {
  freelancerName: '',
  clientName: '',
  clientEmail: '',
  freelancerUpi: '',
  projectTitle: '',
  areaOfWork: '',
  projectDesc: '',
  components: '',
  clientResponsibilities: '',
  totalCost: '',
  advancePct: '50',
  gstPct: '18',
  paymentTerms: '',
  deliveryMethod: '',
  timeline: '',
  revisions: '',
  warranty: '',
  cancellation: '',
  additionalNotes: ''
};

export const INITIAL_TOGGLES = {
  scope: true,
  components: true,
  payment: true,
  warranty: true,
  liability: true,
  cancellation: true,
  ip: true,
  nda: true,
  client: true,
  dispute: true,
  force: false,
  sig: true
};
