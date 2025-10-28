(async () => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjkwMDdlOTM5YzRlODVlYjEwYjIzMDA3In0sImlhdCI6MTc2MTY0MDA4OSwiZXhwIjoxNzYxNjQzNjg5fQ.Is_Q5m_4c-H5OfY6oji-5B0Nyy8QqikyCWPoBa2XDGU';
  const base = 'http://localhost:3001';

  try {
    console.log('1) Creating reminder...');
    let res = await fetch(`${base}/api/reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ message: 'Automated test reminder', remindAt: '2025-10-29T10:00:00Z', recipientEmail: 'test@example.com' })
    });
    const created = await res.json();
    console.log('Create response status:', res.status);
    console.log('Create response body:', JSON.stringify(created, null, 2));

    const id = created._id;
    if (!id) {
      console.error('No reminder id returned, aborting further tests.');
      return;
    }

    console.log('\n2) Listing reminders...');
    res = await fetch(`${base}/api/reminders`, { headers: { 'Authorization': `Bearer ${token}` } });
    const list = await res.json();
    console.log('List status:', res.status);
    console.log('List body:', JSON.stringify(list, null, 2));

    console.log('\n3) Deleting the created reminder...');
    res = await fetch(`${base}/api/reminders/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    const del = await res.json();
    console.log('Delete status:', res.status);
    console.log('Delete body:', JSON.stringify(del, null, 2));

    console.log('\n4) Listing reminders after deletion...');
    res = await fetch(`${base}/api/reminders`, { headers: { 'Authorization': `Bearer ${token}` } });
    const list2 = await res.json();
    console.log('List after delete status:', res.status);
    console.log('List after delete body:', JSON.stringify(list2, null, 2));

    console.log('\n5) Attempt unauthorized access (no token)...');
    res = await fetch(`${base}/api/reminders`);
    const unauth = await res.json().catch(() => null);
    console.log('Unauthorized status:', res.status);
    console.log('Unauthorized body:', JSON.stringify(unauth, null, 2));

  } catch (err) {
    console.error('Test script error:', err);
  }
})();