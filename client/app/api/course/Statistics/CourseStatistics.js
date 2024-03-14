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

  /**
   * Fetches assessments statistics, which comprises of the stats for each assessment.
   * - Assessment information (itself, tab, category)
   * - Maximum Grade attainable for each assessment
   * - Average and Stdev of the grades obtained by students
   * - Average and Stdev of the time taken by students to finish the assessments
   * - Number of all students, and also number of attempting and submitted students
   */
  fetchAssessmentsStatistics() {
    return this.client.get(`${this.#urlPrefix}/assessments`);
  }

  get #urlPrefix() {
    return `/courses/${this.courseId}/statistics`;
  }
}
