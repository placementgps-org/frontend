import fs from 'fs';
import path from 'path';

// Internal id generator (must match what was used to create aptitudeContent.json originally)
const idify = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const categoryMap = {
  "Numerical Practice": "numerical",
  "Logical Reasoning": "logical",
  "Verbal Ability": "verbal",
  "Situational Judgement": "situational",
  "Analytical & Critical Thinking": "analytical"
};

const run = () => {
  const sourcePath = 'C:\\Users\\bobby\\Desktop\\placement gps\\placement_gps_all_160_topic_notes.json';
  const targetPath = path.join(process.cwd(), 'server', 'data', 'aptitudeContent.json');

  if (!fs.existsSync(sourcePath)) {
    console.error('Source file not found at:', sourcePath);
    return;
  }
  
  if (!fs.existsSync(targetPath)) {
    console.error('Target aptitudeContent.json not found at:', targetPath);
    return;
  }

  const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const targetData = JSON.parse(fs.readFileSync(targetPath, 'utf8'));

  let importedCount = 0;

  // Iterate over source categories
  for (const [sourceCatName, sourceTopics] of Object.entries(sourceData)) {
    const internalCatId = categoryMap[sourceCatName];
    if (!internalCatId) {
      console.warn(`Unmapped category in source: ${sourceCatName}`);
      continue;
    }

    const internalTopicsList = targetData.topics[internalCatId];
    if (!internalTopicsList) {
      console.warn(`Internal category array missing for: ${internalCatId}`);
      continue;
    }

    // Iterate over source topics
    for (const [sourceTopicName, sourceTopicContent] of Object.entries(sourceTopics)) {
      const internalTopicId = idify(sourceTopicName);
      
      const targetTopic = internalTopicsList.find(t => t.id === internalTopicId);
      if (targetTopic) {
        // Overwrite the content with the exact structure from the provided JSON
        // We ensure we carry over exactly what's there
        targetTopic.content = sourceTopicContent;
        importedCount++;
      } else {
        console.warn(`Could not find matching internal topic for: ${sourceTopicName} (ID: ${internalTopicId}) in category ${internalCatId}`);
      }
    }
  }

  fs.writeFileSync(targetPath, JSON.stringify(targetData, null, 2));
  console.log(`Successfully imported ${importedCount} topics into aptitudeContent.json`);
};

run();
