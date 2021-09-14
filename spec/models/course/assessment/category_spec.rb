# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Category do
  it { is_expected.to belong_to(:course).without_validating_presence }
  it { is_expected.to have_many(:tabs) }
  it { is_expected.to have_many(:assessments).through(:tabs) }

  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    describe 'callbacks' do
      describe 'after category was initialized' do
        subject { build(:course_assessment_category) }

        it 'sets the folder to be open with immediate effect' do
          expect(subject.folder.start_at).to be <= Time.zone.now
        end
      end

      describe 'after the category is saved' do
        let(:category_attributes) { {} }
        subject { create(:course_assessment_category, category_attributes) }

        it 'sets the folder to have the same attributes as the category' do
          expect(subject.folder.name).to eq(subject.title)
          expect(subject.folder.course).to eq(subject.course)
          expect(subject.folder.parent).to eq(subject.course.root_folder)
        end

        context 'when category title is not a valid filename' do
          let(:category_attributes) { { title: 'lol\lol' } }

          it 'creates a folder with the valid name' do
            expect(subject.folder.name).to eq('lol lol')
          end
        end
      end

      describe 'after category title was changed' do
        subject { create(:course_assessment_category) }

        it 'updates the folder title' do
          new_title = 'Mission'

          subject.title = new_title
          subject.save

          expect(subject.folder.name).to eq(new_title)
        end
      end
    end

    describe '.default_scope' do
      let(:course) { create(:course) }
      let!(:categories) { create_list(:course_assessment_category, 2, course: course) }
      it 'orders by ascending weight' do
        weights = course.assessment_categories.map(&:weight)
        expect(weights.length).to be > 1
        expect(weights.each_cons(2).all? { |a, b| a <= b }).to be_truthy
      end
    end

    describe '.after_course_initialize' do
      let(:course) { build(:course) }

      it 'builds only one category' do
        expect(course.assessment_categories.length).to eq(1)

        # Call the callback one more time
        Course::Assessment::Category.after_course_initialize(course)
        expect(course.assessment_categories.length).to eq(1)
      end
    end

    describe '#build_initial_tab' do
      subject { build(:course_assessment_category) }

      it 'only builds one tab' do
        expect(subject.tabs.length).to eq(1)

        subject.send(:build_initial_tab)
        expect(subject.tabs.length).to eq(1)
      end
    end

    context 'when there is another category with the same title' do
      let(:course) { create(:course) }
      let(:common_title) { 'Assessments' }
      let!(:category) { create(:course_assessment_category, course: course, title: common_title) }

      context 'after category was created' do
        subject { build(:course_assessment_category, title: common_title, course: course) }

        it 'creates a folder with the proper name' do
          subject.save

          expect(subject.folder.name).to eq("#{subject.title} (0)")
        end
      end

      context 'after category was changed' do
        subject { create(:course_assessment_category, title: common_title, course: course) }

        it 'updates the folder with proper name' do
          subject.title = common_title
          subject.save

          expect(subject.folder.name).to eq("#{common_title} (0)")
        end
      end
    end
  end
end
