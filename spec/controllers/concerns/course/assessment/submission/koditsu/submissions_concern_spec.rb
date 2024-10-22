# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::Koditsu::SubmissionsConcern do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let!(:admin) { create(:administrator) }
    let!(:student_one) { create(:user, name: 'Student One') }
    let!(:student_two) { create(:user, name: 'Student Two') }

    class self::DummyController < ApplicationController
      include Course::Assessment::Submission::Koditsu::SubmissionsConcern
    end

    let!(:dummy_controller) { self.class::DummyController.new }
    let!(:course) { create(:course, koditsu_workspace_id: '66fd754a3486c7994c809e16') }
    let!(:course_user_one) { create(:course_user, user: student_one, course: course) }
    let!(:course_user_two) { create(:course_user, user: student_two, course: course) }
    let!(:assessment) do
      create(:course_assessment_assessment,
             course: course,
             start_at: '2024-06-01T11:55:00.000Z',
             end_at: '2024-06-01T13:05:00.000Z',
             is_synced_with_koditsu: true,
             is_koditsu_enabled: true,
             koditsu_assessment_id: '66fa7643b97aed0e8e189633')
    end
    let(:question_test_cases) do
      public_report = File.read(question_test_public_report_path)
      public_test_cases = Course::Assessment::ProgrammingTestCaseReport.
                          new(public_report).test_cases.map do |test_case|
        Course::Assessment::Question::ProgrammingTestCase.new(identifier: test_case.identifier,
                                                              test_case_type: :public_test)
      end

      public_test_cases
    end
    let(:question_other_test_cases) do
      public_report = File.read(question_other_test_public_report_path)
      public_test_cases = Course::Assessment::ProgrammingTestCaseReport.
                          new(public_report).test_cases.map do |test_case|
        Course::Assessment::Question::ProgrammingTestCase.new(identifier: test_case.identifier,
                                                              test_case_type: :public_test)
      end

      public_test_cases
    end
    let(:question_test_public_report_path) do
      File.join(Rails.root, 'spec/fixtures/course/programming_public_test_report.xml')
    end
    let(:question_other_test_public_report_path) do
      File.join(Rails.root, 'spec/fixtures/course/programming_other_public_test_report.xml')
    end
    let!(:question_one) do
      create(:course_assessment_question_programming,
             assessment: assessment,
             maximum_grade: 10,
             is_synced_with_koditsu: true,
             test_cases: question_test_cases,
             koditsu_question_id: '66fb2e66cd0216558fde9998')
    end
    let!(:question_two) do
      create(:course_assessment_question_programming,
             assessment: assessment,
             maximum_grade: 10,
             is_synced_with_koditsu: true,
             test_cases: question_other_test_cases,
             koditsu_question_id: '66fc14477b095d84b42cc6cf')
    end

    before do
      dummy_controller.instance_variable_set(:@assessment, assessment)
      dummy_controller.instance_variable_set(:@user, admin)
    end

    context 'in fetching all submissions from Koditsu' do
      let(:response) do
        JSON.parse(
          File.read(File.join(Rails.root,
                              'spec/fixtures/course/koditsu/koditsu_submissions_response.json'))
        )
      end

      it 'updates all submissions within assessment properly' do
        # replace the user placeholder in json with the data actually used in this spec,
        # which is using given name but generated email through our FactoryBot
        response['data'][0]['user'] = {
          'name' => student_one.name,
          'email' => student_one.email
        }

        response['data'][1]['user'] = {
          'name' => student_two.name,
          'email' => student_two.email
        }

        dummy_controller.send(:process_fetch_submissions_response, response['data'])

        current_assessment = dummy_controller.instance_variable_get(:@assessment)
        submissions = current_assessment.submissions.reload

        expect(submissions.count).to eq(2)
        expect(submissions[0].workflow_state).to eq('submitted')
        expect(submissions[1].workflow_state).to eq('submitted')

        student_one_answers = submissions[0].answers
        student_two_answers = submissions[1].answers

        expect(student_one_answers[0].correct).to be_truthy
        expect(student_one_answers[1].correct).to be_falsey

        expect(student_two_answers[0].correct).to be_falsey
        expect(student_two_answers[1].correct).to be_falsey

        first_submission_time = response['data'][0]['questions'][0]['filesSavedAt']
        parsed_submission_time = DateTime.parse(first_submission_time).in_time_zone

        expect(submissions[0].submitted_at).to be_within(1.second).of parsed_submission_time
        expect(submissions[1].submitted_at).to be_within(1.second).of current_assessment.end_at
      end
    end
  end
end
