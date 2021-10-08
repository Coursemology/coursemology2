import CourseAPI from 'api/course';

export function fetchAllPosts(){
    return CourseAPI.forums.getAllPosts()
        .then((response) => response.data)
        .then((data) => {
            console.log(data)
        })
}
