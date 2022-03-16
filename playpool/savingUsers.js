function saveMoreStudents() {
    const studentList = [
        {name: 'Gizuska'},
        {name: 'Tibor'},
        {name: 'Anikó'}
    ]
    db.students.insertMany(studentList);
}

saveMoreStudents();