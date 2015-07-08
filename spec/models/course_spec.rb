require 'rails_helper'

RSpec.describe Course, type: :model do
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:owner) { create(:user) }

    it { is_expected.to belong_to(:creator) }
    it { is_expected.to have_many(:course_users).inverse_of(:course).dependent(:destroy) }
    it { is_expected.to have_many(:users).through(:course_users) }
    it { is_expected.to have_many(:announcements).inverse_of(:course).dependent(:destroy) }
    it { is_expected.to have_many(:levels).inverse_of(:course).dependent(:destroy) }
    it { is_expected.to have_many(:groups).inverse_of(:course).dependent(:destroy) }
    it { is_expected.to have_many(:lesson_plan_items).inverse_of(:course).dependent(:destroy) }
    it { is_expected.to have_many(:lesson_plan_milestones).inverse_of(:course).dependent(:destroy) }

    it { is_expected.to validate_presence_of(:title) }

    context 'when course is created' do
      subject { Course.new(creator: owner, updater: owner) }

      it { is_expected.not_to be_published }
      it { is_expected.not_to be_opened }

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
      let!(:levels) do
        create_list(:course_level, 5, course: course).map(&:experience_points_threshold)
      end

      describe '.levels' do
        it 'returns levels is ascending order' do
          course_level_numbers = course.levels.map(&:experience_points_threshold)
          expect(course_level_numbers).to eq levels
        end
      end

      describe '#compute_level' do
        it 'returns nil when experience_points is 0' do
          level = course.compute_level(0)
          expect(level).to be_nil
        end
      end

      describe '#compute_level_number' do
        context 'when experience_points is 0' do
          it 'returns 0' do
            level = course.compute_level_number(0)
            expect(level).to eq 0
          end
        end

        context 'when experience_points is between threshold' do
          it 'returns the correct level number' do
            experience_points = levels.max - 1
            level = course.compute_level_number(experience_points)
            expect(level).to eq levels.size - 1
          end
        end

        context 'when experience_points coincides with a level threshold' do
          it 'returns the correct level number' do
            experience_points = levels[1]
            level = course.compute_level_number(experience_points)
            expect(level).to eq 2
          end
        end

        context 'when experience_points exceeds all level thresholds' do
          it 'returns the correct level number' do
            experience_points = levels.max + 1
            level = course.compute_level_number(experience_points)
            expect(level).to eq levels.size
          end
        end
      end

      describe '#numbered_levels' do
        it 'numbers levels' do
          numbering = course.numbered_levels.map(&:level_number)
          expect(numbering).to eq((1..(levels.size)).to_a)
        end
      end
    end

    describe '#grouped_lesson_plan_items_with_milestones' do
      let(:course) { create(:course) }
      let!(:milestones) do
        [3.days.ago, 2.days.ago, 2.days.from_now].map do |start_time|
          create(:course_lesson_plan_milestone, course: course, start_time: start_time)
        end
      end
      let!(:lesson_plan_items) do
        [3.days.ago, 2.days.ago, 1.days.from_now, 3.days.from_now].map do |start_time|
          create(:course_lesson_plan_item, course: course, start_time: start_time)
        end
      end
      subject { course.grouped_lesson_plan_items_with_milestones }

      context 'when no milestones exist' do
        let!(:milestones) { [] }
        it 'groups all items under the nil milestone' do
          expect(subject.length).to eq(1)
          expect(subject.keys).to eq([nil])
          expect(subject[nil].each_cons(2).all? { |(a, b)| a.start_time <= b.start_time }).to \
            be_truthy
        end
      end

      context 'when the first milestone comes after the first event' do
        before do
          milestone_to_delete = milestones.shift
          milestone_to_delete.destroy
        end

        it 'groups all items before the first milestone under the nil milestone' do
          expect(subject).to have_key(nil)
          expect(subject[nil]).to contain_exactly(lesson_plan_items.first)
        end
      end

      context 'when the first milestone and the first event starts at the same time' do
        it 'groups the first event under the first milestone' do
          expect(subject[milestones.first]).to include(lesson_plan_items.first)
        end
      end

      context 'when no items exist' do
        it 'creates the keys for all milestones' do
          expect(subject.length).to eq(milestones.length)
        end
      end
    end

    describe '#staff' do
      let(:course) { create(:course, creator: owner, updater: owner) }
      let(:course_owner) { course.course_users.find_by!(user: owner) }
      let(:teaching_assistant) { create(:course_teaching_assistant, course: course) }
      let(:manager) { create(:course_manager, :approved, course: course) }

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
  end
end
