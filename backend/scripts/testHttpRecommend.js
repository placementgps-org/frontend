async function testEndpoint() {
  try {
    const rolesToTest = [
      'full-stack-developer',
      'software-engineer',
      'ai-engineer',
      'data-scientist',
      'cybersecurity-engineer',
      'business-analyst',
      'financial-analyst',
      'hr-specialist'
    ];

    for (const r of rolesToTest) {
      const response = await fetch(`http://localhost:5005/api/courses/recommend?role=${r}&limit=3`);
      const data = await response.json();
      console.log(`Endpoint Test for role "${r}": Status ${response.status}, Count: ${data.data?.length}`);
      if (data.data && data.data.length > 0) {
        data.data.forEach(c => {
          console.log(`   - ${c.courseName} (${c.relevanceScore}%) [${c.provider}]`);
          console.log(`     Link: ${c.courseLink}`);
        });
      } else {
        console.error(`   ❌ No courses returned for ${r}`);
      }
      console.log();
    }
  } catch (e) {
    console.error('Endpoint test error:', e);
  }
}

testEndpoint();
