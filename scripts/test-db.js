import { db } from '../src/lib/firebase.js';
import { collection, getDocs } from 'firebase/firestore';

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    
    // Try to get courses
    const coursesRef = collection(db, 'courses');
    const coursesSnapshot = await getDocs(coursesRef);
    
    console.log('Courses collection size:', coursesSnapshot.size);
    
    if (coursesSnapshot.size > 0) {
      console.log('Sample course data:');
      coursesSnapshot.docs.slice(0, 2).forEach(doc => {
        console.log('Course ID:', doc.id);
        console.log('Course data:', doc.data());
        console.log('---');
      });
    } else {
      console.log('No courses found in database');
    }
    
  } catch (error) {
    console.error('Error testing database:', error);
  }
}

testDatabaseConnection();