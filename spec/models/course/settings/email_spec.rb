# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Settings::Email, type: :model do
  it { is_expected.to belong_to(:course).inverse_of(:setting_emails) }
  it { is_expected.to belong_to(:assessment_category).inverse_of(:setting_emails).optional }
  it { is_expected.to have_many(:email_unsubscriptions) }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '.after_course_initialize' do
      let!(:course) { create(:course) }

      it 'builds a set of default email settings' do
        expect(course.setting_emails.length).to eq(15)

        # Call the callback one more time
        Course::Settings::Email.after_course_initialize(course)
        expect(course.setting_emails.length).to eq(15)
      end
    end

    describe '.after_assessment_category_initialize' do
      let!(:course) { create(:course) }
      let!(:category) { create(:course_assessment_category, course: course) }

      it 'builds a set of default email settings including email settings for an additional category' do
        expect(course.setting_emails.length).to eq(21)

        # Call the callback one more time
        Course::Settings::Email.after_assessment_category_initialize(course)
        expect(course.setting_emails.length).to eq(21)
      end
    end

    describe '.student_setting' do
      let!(:course) { create(:course) }

      it 'filters email setting available for students' do
        expect(course.setting_emails.student_setting.length).to eq(10)
      end
    end

    describe '.manager_setting' do
      let!(:course) { create(:course) }

      it 'filters email setting available for managers' do
        expect(course.setting_emails.manager_setting.length).to eq(10)
      end
    end

    describe '.teaching_staff_setting' do
      let!(:course) { create(:course) }

      it 'filters email setting available for teaching staff' do
        expect(course.setting_emails.teaching_staff_setting.length).to eq(9)
      end
    end
  end
end
