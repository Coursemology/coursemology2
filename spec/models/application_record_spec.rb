# frozen_string_literal: true
require 'rails_helper'

RSpec.describe ApplicationRecord, type: :model do
  describe '.calculated_expression' do
    let!(:instance) { create(:instance) }
    with_tenant(:instance) do
      let(:course) { create(:course) }

      context 'with a plain (no-argument) calculated attribute' do
        subject { CourseUser.calculated_expression(:experience_points) }

        it 'returns a parenthesised Arel expression wrapping the lambda\'s SQL' do
          expect(subject).to be_a(Arel::Nodes::SqlLiteral)
          expect(subject.to_s).to start_with('(').and end_with(')')
          expect(subject.to_s).to include('SUM(points_awarded)')
        end

        it 'matches the SQL the gem builds for the SELECT projection, so the two cannot drift' do
          projection = CourseUser.all.calculated(:experience_points).arel.projections.
                       find { |p| p.respond_to?(:right) && p.right.to_s == 'experience_points' }

          expect(projection.left.to_s).to eq(subject.to_s)
        end
      end

      context 'with a parameterised calculated attribute' do
        # Course::Forum defines `calculated :topic_unread_count, ->(user) { ... }`.
        let(:user) { create(:user) }

        it 'forwards arguments to the lambda' do
          expression = Course::Forum.calculated_expression(:topic_unread_count, user)

          expect(expression).to be_a(Arel::Nodes::SqlLiteral)
          expect(expression.to_s).to include('course_forum_topics')
        end

        it 'raises ArgumentError when the required argument is missing' do
          expect { Course::Forum.calculated_expression(:topic_unread_count) }.
            to raise_error(ArgumentError)
        end
      end

      context 'when the attribute is not defined' do
        it 'raises a descriptive ArgumentError naming the model and the attribute' do
          expect { CourseUser.calculated_expression(:not_a_real_attribute) }.
            to raise_error(ArgumentError, /CourseUser has no calculated attribute :not_a_real_attribute/)
        end
      end

      describe 'normalisation of the lambda return value' do
        def stub_calculated(model, attribute, callable)
          allow(model).to receive(:calculated).and_return(double(calculated: { attribute => callable }))
        end

        it 'wraps a raw SQL string' do
          stub_calculated(CourseUser, :probe, -> { 'SELECT 1' })

          expect(CourseUser.calculated_expression(:probe).to_s).to eq('(SELECT 1)')
        end

        it 'wraps a relation via #to_sql' do
          stub_calculated(CourseUser, :probe, -> { CourseUser.select(:id) })

          expect(CourseUser.calculated_expression(:probe).to_s).to include('SELECT "course_users"."id"')
        end

        it 'sanitises an array, so bound values cannot be interpolated raw' do
          stub_calculated(CourseUser, :probe, -> { ['SELECT ?', "O'Brien"] })

          expect(CourseUser.calculated_expression(:probe).to_s).to eq("(SELECT 'O''Brien')")
        end

        it 'passes an Arel node through untouched' do
          node = CourseUser.arel_table[:id]
          stub_calculated(CourseUser, :probe, -> { node })

          expect(CourseUser.calculated_expression(:probe)).to eq(node)
        end
      end

      describe 'the ordering it exists to support' do
        # The helper's whole purpose: order by the expression rather than the alias, so ordering
        # survives a relation whose select list has been cleared.
        let!(:earlier) { create(:course_student, course: course) }
        let!(:later) { create(:course_student, course: course) }

        before do
          create(:course_experience_points_record, course_user: earlier, points_awarded: 100,
                                                   awarded_at: 2.days.ago)
          create(:course_experience_points_record, course_user: later, points_awarded: 100,
                                                   awarded_at: 1.day.ago)
        end

        it 'breaks a tie by who reached the total first' do
          ranked = course.course_users.students.ordered_by_experience_points.to_a

          expect(ranked.index(earlier)).to be < ranked.index(later)
        end

        it 'still orders correctly after a count has cleared the select list' do
          relation = course.course_users.students.ordered_by_experience_points
          relation.count # the operation that used to corrupt the relation

          expect(relation.to_a.index(earlier)).to be < relation.to_a.index(later)
        end
      end
    end
  end
end
