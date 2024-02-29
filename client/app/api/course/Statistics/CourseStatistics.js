import BaseCourseAPI from '../Base';

// Contains course-level statistics, which largely comprise of aggregate data across
// all students, all staff, or all assessments, etc.
export default class CourseStatisticsAPI extends BaseCourseAPI {
  /**
   * Fetches all student statistics, which namely comprise of (for each student):
   * - Their tutors
   * - Their level
   * - Their experience points
   * - Their number of videos watched
   * - Their average video watch percentage
   */
  fetchAllStudentStatistics() {
    return this.client.get(`${this.#urlPrefix}/students`);
  }

  /**
   * Fetches all staff statistics, which namely comprise of (for each staff):
   * - Their number of marked assessments
   * - Their number of students
   * - Their average time taken per grading
   * - The standard deviation
   */
  fetchAllStaffStatistics() {
    return this.client.get(`${this.#urlPrefix}/staff`);
  }

  /**
   * Fetches course progression statistics, which comprise of assessment data and relevant student
   * submission data.
   */
  fetchCourseProgressionStatistics() {
    return this.client.get(`${this.#urlPrefix}/course/progression`);
  }

  /**
   * Fetches course performance statistics, which comprises of various performance metrics.
   */
  fetchCoursePerformanceStatistics() {
    return this.client.get(`${this.#urlPrefix}/course/performance`);
  }

  get #urlPrefix() {
    return `/courses/${this.courseId}/statistics`;
  }
}
