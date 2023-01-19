# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course, type: :model do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:owner) { create(:user) }

    it { is_expected.to belong_to(:instance).inverse_of(:courses).without_validating_presence }
    it { is_expected.to have_many(:course_users).inverse_of(:course).dependent(:destroy) }
    it { is_expected.to have_many(:users).through(:course_users) }
    it { is_expected.to have_many(:invitations).dependent(:destroy) }
    it { is_expected.to have_many(:announcements).dependent(:destroy) }
    it { is_expected.to have_many(:achievements).dependent(:destroy) }
    it { is_expected.to have_many(:levels).dependent(:destroy) }
    it { is_expected.to have_many(:group_categories).dependent(:destroy) }
    it { is_expected.to have_many(:groups).through(:group_categories) }
    it { is_expected.to have_many(:assessment_categories).dependent(:destroy) }
    it { is_expected.to have_many(:assessments).through(:assessment_categories) }
    it { is_expected.to have_many(:assessment_skills).dependent(:destroy) }
    it { is_expected.to have_many(:assessment_skill_branches).dependent(:destroy) }
    it { is_expected.to have_many(:discussion_topics) }
    it { is_expected.to have_many(:forums).dependent(:destroy) }
    it { is_expected.to have_many(:lesson_plan_items).dependent(:destroy) }
    it { is_expected.to have_many(:lesson_plan_events).through(:lesson_plan_items) }
    it { is_expected.to have_many(:lesson_plan_milestones).through(:lesson_plan_items) }
    it { is_expected.to have_many(:material_folders).dependent(:destroy) }
    it { is_expected.to have_many(:surveys).through(:lesson_plan_items) }
    it { is_expected.to have_many(:videos).through(:lesson_plan_items) }
    it { is_expected.to have_many(:setting_emails).dependent(:destroy) }
    it { is_expected.to have_one(:duplication_traceable).dependent(:destroy) }

    it { is_expected.to define_enum_for(:default_timeline_algorithm) }

    it { is_expected.to validate_presence_of(:title) }

    it { should delegate_method(:staff).to(:course_users) }
    it { should delegate_method(:instructors).to(:course_users) }
    it { should delegate_method(:managers).to(:course_users) }
    it { should delegate_method(:user?).to(:course_users) }
    it { should delegate_method(:level_for).to(:levels) }
    it { should delegate_method(:default_level?).to(:levels) }
    it { should delegate_method(:mass_update_levels).to(:levels) }
    it { should delegate_method(:source).to(:duplication_traceable).allow_nil }
    it { should delegate_method(:source=).to(:duplication_traceable).with_arguments(nil).allow_nil }

    context 'when course is created' do
      subject { Course.new(creator: owner, updater: owner) }

      it { is_expected.not_to be_published }
      it { is_expected.not_to be_enrollable }

      it 'contains the provided user as the owner' do
        expect(subject.course_users.map(&:user)).to include(owner)
      end

      context 'when the creator is specified after initialisation' do
        subject { Course.new }
        before do
          subject.creator = subject.updater = owner
          subject.save
        end

        it 'contains the provided user as the owner' do
          expect(subject.course_users.map(&:user)).to include(owner)
        end
      end
    end

    describe 'levels' do
      let!(:user) { create(:administrator) }
      let!(:course) { create(:course) }
      let!(:levels) { create_list(:course_level, 5, course: course) }
      before { course.reload }

      describe '.levels' do
        it 'returns levels is ascending order' do
          level_thresholds = course.levels.map(&:experience_points_threshold)
          expect(level_thresholds).to eq(level_thresholds.sort)
        end
      end

      describe '#level_for' do
        context 'when experience_points is 0 or negative' do
          it 'returns the first level' do
            [0, -1].each do |experience_points|
              expect(course.level_for(experience_points)).to be_default_level
            end
          end
        end

        context 'when experience_points is a positive number' do
          it 'returns the correct level number' do
            course.levels.each do |level|
              experience_points = level.experience_points_threshold
              expect(course.level_for(experience_points)).to eq(level)
              expect(course.level_for(experience_points + 1)).to eq(level)
            end
          end
        end
      end
    end

    describe '#staff' do
      let(:course) { create(:course, creator: owner, updater: owner) }
      let(:course_owner) { course.course_users.find_by!(user: owner) }
      let(:teaching_assistant) { create(:course_teaching_assistant, course: course) }
      let(:manager) { create(:course_manager, course: course) }

      it 'returns all the staff in course' do
        expect(course.staff).to contain_exactly(teaching_assistant, manager, course_owner)
      end
    end

    describe '#generate_registration_key' do
      it 'starts with "C"' do
        subject.generate_registration_key
        expect(subject.registration_key).to start_with('C')
      end
    end

    describe '.search' do
      let(:keyword) { 'KeyWord' }
      let!(:course_with_keyword_in_title) do
        course = create(:course, title: "Course#{keyword}")
        # We should be able to find the course even it doesn't have any course_users
        course.course_users.destroy_all
        course
      end
      let!(:course_with_keyword_in_description) do
        course = create(:course, description: "Awesome#{keyword.downcase}Math!")
        # We should not return multiple instances of same course if it has multiple course_users
        create_list(:course_user, 2, course: course)
        course
      end
      let!(:course_with_keyword_in_user_name) do
        user = create(:user, name: "I am #{keyword}")
        course_user = create(:course_user, user: user)
        course_user.course
      end

      subject { Course.search(keyword).to_a }
      it 'finds the course' do
        subject

        expect(subject.count(course_with_keyword_in_title)).to eq(1)
        expect(subject.count(course_with_keyword_in_description)).to eq(1)
        expect(subject.count(course_with_keyword_in_user_name)).to eq(1)
      end
    end

    describe '#root_folder?' do
      let(:course) { build(:course) }
      subject { course.root_folder? }

      context 'when course is a new record' do
        it { is_expected.to be_truthy }

        context 'when there is no root folder' do
          before { course.material_folders.clear }
          it { is_expected.to be_falsey }
        end
      end

      context 'when course is persisted' do
        before { course.save }
        it { is_expected.to be_truthy }

        context 'when there is no root folder' do
          before { course.root_folder.destroy }

          it { is_expected.to be_falsey }
        end
      end
    end

    describe '#default_level?' do
      let(:course) { build(:course) }
      subject { course.default_level? }

      context 'when course is a new record' do
        it { is_expected.to be_truthy }
      end

      context 'when course is persisted' do
        before { course.save }
        it { is_expected.to be_truthy }
      end
    end

    describe '.active_in_past_7_days' do
      let!(:courses) { create_list(:course, 3) }

      it 'returns the active courses' do
        old_count = instance.courses.active_in_past_7_days.count

        create(:course_user, course: courses.sample, last_active_at: Time.zone.now)

        new_count = instance.courses.active_in_past_7_days.count
        expect(new_count).to eq(old_count + 1)
      end
    end

    describe 'calculated attributes' do
      let(:course) { create(:course) }
      let!(:course_users) { create_list(:course_user, 2, course: course) }

      describe '.active_user_count' do
        before { course_users.sample.update_column(:last_active_at, Time.zone.now) }
        subject do
          Course.where(id: course.id).calculated(:active_user_count).first.active_user_count
        end

        it { is_expected.to eq(1) }
      end

      describe '.user_count' do
        subject { Course.where(id: course.id).calculated(:user_count).first.user_count }

        it { is_expected.to eq(course.course_users.student.count) }
      end
    end
  end
end
