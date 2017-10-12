# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Duplicator, type: :model do
  describe '#time_shift' do
    subject { Duplicator.new([], time_shift: 1.year).time_shift(original_date) }

    context 'when shifted date will be below the cap' do
      let(:original_date) { Time.zone.now }
      # Full time shifted date
      let(:expected_date) { original_date + 1.year }

      it { is_expected.to be_within(1.second).of expected_date }
    end

    context 'when shifted date will be above the cap' do
      let(:original_date) { DateTime.new(9999, 8, 1).in_time_zone('UTC') }
      # Capped date
      let(:expected_date) { DateTime.new(9999, 12, 31).in_time_zone('UTC') }

      it { is_expected.to be_within(1.second).of expected_date }
    end
  end

  context 'when Plain Old Ruby Objects' do
    class SimpleObject
      attr_reader :id

      def initialize(id)
        @id = id
      end

      def initialize_duplicate(_duplicator, _other)
      end

      def ==(other)
        self.class == other.class && state == other.state
      end

      protected

      def state
        [@id]
      end
    end

    # ComplexObject has children
    class ComplexObject
      attr_reader :id
      attr_reader :children

      def initialize(id, children)
        @id = id
        @children = children
      end

      def initialize_duplicate(duplicator, other)
        # Need compact to remove nils caused by excluded objects
        # Alternate method is below with the ActiveRecord object
        @children = duplicator.duplicate(other.children).tap(&:compact!)
      end

      def ==(other)
        self.class == other.class && state == other.state
      end

      def inspect
        children = @children.map(&:id).join(', ')
        "<#{self.class}: 0x#{object_id} @id=#{@id} @children=[#{children}]>"
      end

      protected

      def state
        [@id, @children.map(&:id)]
      end
    end

    def create_complex_objects
      #
      #       ---> c1 ---> s2
      #       |     |
      #       |     -----> s1
      #       |     |
      #  c3 -----> c2
      #       |
      #       ---> s3
      #
      @s1 = SimpleObject.new(1)
      @s2 = SimpleObject.new(2)
      @s3 = SimpleObject.new(3)

      # setup 2 objects with overlapping children
      @c1 = ComplexObject.new(11, [@s1, @s2])
      @c2 = ComplexObject.new(12, [@s1])

      # setup an even more complicated object
      @c3 = ComplexObject.new(13, [@c1, @c2, @s3])
    end

    def create_cyclic_graph
      #
      #       ------> c3 ------
      #       |       ^       v
      # c1-> c2       |      c5
      #       |       |       |
      #       ------> c4 <-----
      #               |
      #               ----> s1
      #
      @s1 = SimpleObject.new(1)
      @c4 = ComplexObject.new(14, []) # assign children later
      @c5 = ComplexObject.new(15, [@c4])
      @c3 = ComplexObject.new(13, [@c5])
      @c2 = ComplexObject.new(12, [@c3, @c4])
      @c1 = ComplexObject.new(11, [@c2])

      @c4.instance_variable_set(:@children, [@s1, @c3]) # create cycle
    end

    def create_second_cyclic_graph
      #
      #      ----> c22 <--
      #      |      |    |
      # c21 --      |    |
      #      |      |--> |
      #      ----------> c23
      #
      @c22 = ComplexObject.new(22, []) # assign children later
      @c23 = ComplexObject.new(23, [@c22])
      @c21 = ComplexObject.new(21, [@c22, @c23])

      @c22.instance_variable_set(:@children, [@c23])
    end

    context 'when SimpleObject is duplicated' do
      before(:each) do
        @obj_a = SimpleObject.new(2)
      end

      it 'is not duplicated if excluded' do
        @duplicator = Duplicator.new([@obj_a])
        duplicated_object = @duplicator.duplicate(@obj_a)

        expect(duplicated_object).to be_nil
      end

      it 'is duplicated by default' do
        @duplicator = Duplicator.new
        duplicate_of_a = @duplicator.duplicate(@obj_a)

        expect(duplicate_of_a).to_not be_nil
        expect(duplicate_of_a).to_not be(@obj_a)
        expect(duplicate_of_a).to eq(@obj_a)
      end

      it 'is duplicated once' do
        @duplicator = Duplicator.new
        duplicate_of_a = @duplicator.duplicate(@obj_a)
        duplicate_of_a_2 = @duplicator.duplicate(@obj_a)

        expect(duplicate_of_a).to_not be_nil
        expect(duplicate_of_a).to be(duplicate_of_a_2)
      end
    end

    context 'when ComplexObject is duplicated' do
      before(:each) do
        create_complex_objects
      end

      context 'without exclusions' do
        before(:each) do
          @duplicator = Duplicator.new
        end

        it 'duplicates object' do
          dup_c1 = @duplicator.duplicate(@c1)

          orig_children = @c1.children
          dup_children = dup_c1.children

          expect(dup_c1).to eq(@c1)
          expect(dup_c1).to_not be(@c1)

          # both children should be duplicated, same values, different objects
          expect(dup_children.length).to eq(2)
          (0..1).each do |i|
            expect(orig_children[i]).to eq(dup_children[i])
            expect(orig_children[i]).to_not be(dup_children[i])
          end
        end

        it 'duplicates objects referenced in 2 places once' do
          dup_c1 = @duplicator.duplicate(@c1)
          dup_c2 = @duplicator.duplicate(@c2)

          # dup_s1 should be the same object
          expect(dup_c1.children[0]).to be(dup_c2.children[0])

          # test that @c1 and @c2 have the same values but are not the same object
          expect(dup_c1).to eq(@c1)
          expect(dup_c2).to eq(@c2)
          expect(dup_c1).to_not be(@c1)
          expect(dup_c2).to_not be(@c2)
        end

        it 'duplicates objects with ComplexObject children' do
          dup_c3 = @duplicator.duplicate(@c3)

          expect(dup_c3.children.length).to eq(3)
          expect(dup_c3.children[0]).to eq(@c1)
          expect(dup_c3.children[1]).to eq(@c2)
          expect(dup_c3.children[0]).to_not be(@c1)
          expect(dup_c3.children[1]).to_not be(@c2)
        end
      end

      context 'with exclusions' do
        it 'duplicates ComplexObject but not excluded children' do
          duplicator = Duplicator.new([@s1, @s2])
          dup_c1 = duplicator.duplicate(@c1)

          expect(dup_c1.children).to be_empty
          expect(dup_c1).to_not be(@c1)
        end

        it 'partially duplicates objects when some children are excluded' do
          duplicator = Duplicator.new([@s2, @c2])
          dup_c3 = duplicator.duplicate(@c3)

          dup_c1_children = dup_c3.children[0].children

          expect(dup_c3.children.length).to eq(2)
          expect(dup_c1_children.length).to eq(1)
          expect(dup_c1_children[0]).to eq(@s1)
          expect(dup_c1_children[0]).to_not be(@s1)
        end
      end
    end

    context 'when Plain Old Ruby Object graphs are duplicated' do
      context 'with cycles' do
        before(:each) do
          create_cyclic_graph
        end

        it 'duplicates cyclic two object graph' do
          c1 = ComplexObject.new(11, [])
          c2 = ComplexObject.new(12, [c1])
          c1.instance_variable_set(:@children, [c2])
          duplicator = Duplicator.new
          dup_c1 = duplicator.duplicate(c1)

          expect(dup_c1).to eq(c1)
          expect(dup_c1).to_not be(c1)
          expect(duplicator.instance_variable_get(:@duplicated_objects).length).to eq(2)
          expect(dup_c1.children[0].children[0]).to be(dup_c1)
        end

        it 'duplicates cyclic graph' do
          duplicator = Duplicator.new
          dup_c1 = duplicator.duplicate(@c1)

          expect(dup_c1).to eq(@c1)
          expect(dup_c1).to_not be(@c1)
        end

        it 'duplicates cyclic graph without excluded tail c6' do
          duplicator = Duplicator.new([@s1])
          dup_c1 = duplicator.duplicate(@c1)

          # get original and duplicated node c4
          c4 = @c1.children[0].children[1]
          dup_c4 = dup_c1.children[0].children[1]

          expect(dup_c4.children.length).to_not eq(c4.children.length)
        end

        it 'duplicates cyclic graph without c5' do
          duplicator = Duplicator.new([@c5])
          dup_c1 = duplicator.duplicate(@c1)

          dup_c3 = dup_c1.children[0].children[0]

          expect(dup_c1).to_not be(@c1)
          expect(dup_c3.children).to be_empty
        end

        it 'duplicates cyclic graph without c4' do
          duplicator = Duplicator.new([@c4])
          dup_c1 = duplicator.duplicate(@c1)

          # should be left with c1 -> c2 -> c3 -> c5
          dup_c2 = dup_c1.children[0]
          dup_c3 = dup_c2.children[0]
          dup_c5 = dup_c3.children[0]

          expect(dup_c1.children.length).to eq(1)
          expect(dup_c2.children.length).to eq(1)
          expect(dup_c3.children.length).to eq(1)
          expect(dup_c5.children.length).to eq(0)
        end

        it 'duplicates sub-graph from c3' do
          duplicator = Duplicator.new
          dup_c3 = duplicator.duplicate(@c3)

          dup_c4 = dup_c3.children[0].children[0]

          expect(dup_c3).to_not be(@c3)
          expect(dup_c4.children[0]).to eq(@s1)
          # check cycle
          expect(dup_c4.children[1]).to be(dup_c3)
        end
      end

      context 'when an array of objects is duplicated' do
        before(:each) do
          create_cyclic_graph
          create_second_cyclic_graph
          @duplicator = Duplicator.new
        end

        it 'duplicates objects mentioned twice without creating extras' do
          duplicated_stuff = @duplicator.duplicate([@c1, @c3])

          dup_c3 = duplicated_stuff[0].children[0].children[0]

          expect(duplicated_stuff.length).to eq(2)
          expect(duplicated_stuff[0]).to eq(@c1)
          expect(duplicated_stuff[0]).to_not be(@c1)
          expect(duplicated_stuff[1]).to eq(@c3)
          expect(duplicated_stuff[1]).to_not be(@c3)
          expect(duplicated_stuff[1]).to be(dup_c3)
        end

        it 'duplicates disjoint graphs' do
          duplicated_stuff = @duplicator.duplicate([@c1, @c21])

          expect(duplicated_stuff.length).to eq(2)
          expect(duplicated_stuff[0]).to eq(@c1)
          expect(duplicated_stuff[0]).to_not be(@c1)
          expect(duplicated_stuff[1]).to eq(@c21)
          expect(duplicated_stuff[1]).to_not be(@c21)
        end
      end

      context 'when joined graphs are duplicated' do
        before(:each) do
          create_cyclic_graph
          create_second_cyclic_graph
          # join graphs
          c1_children = @c1.children
          c1_children << @c21
          @c1.instance_variable_set(:@children, c1_children)

          @duplicator = Duplicator.new
        end

        it 'duplicates all objects' do
          @duplicator.duplicate(@c1)

          duplicated_objects = @duplicator.instance_variable_get(:@duplicated_objects)
          expect(duplicated_objects.length).to eq(9)
        end

        it 'duplicates cyclically joined graphs' do
          # join from c21 to c1
          c21_children = @c21.children
          c21_children << @c1
          @c21.instance_variable_set(:@children, c21_children)

          @duplicator.duplicate(@c21)

          duplicated_objects = @duplicator.instance_variable_get(:@duplicated_objects)
          expect(duplicated_objects.length).to eq(9)
        end
      end
    end
  end

  context 'when ActiveRecord objects' do
    class SimpleActiveRecord < ApplicationRecord
      def initialize_duplicate(_duplicator, _other)
      end
    end

    temporary_table(:simple_active_records) do |t|
      t.integer :data
    end

    class ComplexActiveRecord < ApplicationRecord
      has_and_belongs_to_many :children, class_name: 'ComplexActiveRecord',
                                         foreign_key: 'parent_id',
                                         join_table: :children_parents,
                                         association_foreign_key: 'children_id'
      has_and_belongs_to_many :parents, class_name: 'ComplexActiveRecord',
                                        foreign_key: 'children_id',
                                        join_table: :children_parents,
                                        association_foreign_key: 'parent_id'

      def initialize_duplicate(duplicator, other)
        # Need compact to remove nils caused by excluded objects
        self.children = duplicator.duplicate(other.children).compact
      end
    end

    temporary_table(:complex_active_records) do |t|
      t.integer :data
    end

    temporary_table(:children_parents) do |t|
      t.integer :children_id, foreign_key: { references: :complex_active_records, primary_key: :id }
      t.integer :parent_id, foreign_key: { references: :complex_active_records, primary_key: :id }
    end

    def create_ar_cyclic_graph
      #
      #       ------> c3 ------
      #       |       ^       v
      # c1-> c2       |      c5
      #       |       |       |
      #       ------> c4 <-----
      #               |
      #               ----> c6
      #
      @car1 = ComplexActiveRecord.create(data: 11)
      @car2 = @car1.children.create(data: 12)
      @car3 = @car2.children.create(data: 13)
      @car4 = @car2.children.create(data: 14)
      @car5 = @car3.children.create(data: 15)
      @car6 = @car4.children.create(data: 16)
      @car4.children << @car3
      @car5.children << @car4
    end

    def create_ar_graph
      #
      #    --> c22 ---> c23
      #    |
      # c21 --> c24 ---> c25
      #    |              ^
      #    --> c26 -------|
      #
      @car21 = ComplexActiveRecord.create(data: 21)
      @car22 = @car21.children.create(data: 22)
      @car23 = @car22.children.create(data: 23)
      @car24 = @car21.children.create(data: 24)
      @car25 = @car24.children.create(data: 25)
      @car26 = @car21.children.create(data: 26)
      @car26.children = @car24.children
    end

    with_temporary_table(:simple_active_records) do
      context 'when SimpleActiveRecord objects are duplicated' do
        before(:each) do
          @sar_1 = SimpleActiveRecord.create(data: 1)
        end

        it 'is duplicated by default' do
          duplicator = Duplicator.new

          expect do
            @dup_sar_1 = duplicator.duplicate(@sar_1)
            @dup_sar_1.save
          end.to change { SimpleActiveRecord.count }.by(1)

          expect(@sar_1.data).to eq(@dup_sar_1.data)
          expect(@sar_1.id).to_not eq(@dup_sar_1.id)
        end

        it 'is not duplicated if excluded' do
          duplicator = Duplicator.new([@sar_1])
          dup_sar_1 = duplicator.duplicate(@sar_1)

          expect(dup_sar_1).to be_nil
        end

        it 'is duplicated once' do
          duplicator = Duplicator.new
          dup1 = duplicator.duplicate(@sar_1).save
          dup2 = duplicator.duplicate(@sar_1).save

          expect(dup1).to be(dup2)
        end
      end
    end

    with_temporary_table(:complex_active_records) do
      with_temporary_table(:children_parents) do
        # ComplexActiveRecord objects have associations to themselves
        context 'when ComplexActiveRecord objects are duplicated' do
          before(:each) do
            create_ar_graph
          end

          context 'without exclusions' do
            before(:each) do
              @duplicator = Duplicator.new
            end

            it 'duplicates a ComplexActiveRecord object' do
              dup_c22 = @duplicator.duplicate(@car22)
              dup_c22.save

              expect(dup_c22.data).to eq(@car22.data)
              expect(dup_c22.children.size).to eq(1)
              expect(dup_c22.children[0].data).to eq(@car23.data)
              expect(dup_c22.children[0]).to_not be(@car23)
            end

            it 'duplicates object referenced in 2 places once' do
              dup_c24 = @duplicator.duplicate(@car24)
              dup_c24.save
              dup_c26 = @duplicator.duplicate(@car26)
              dup_c26.save

              expect(dup_c24.children[0]).to be(dup_c26.children[0])
              expect(dup_c24.children[0].data).to eq(@car25.data)
            end

            it 'duplicates ComplexActiveRecord object with children' do
              dup_c21 = @duplicator.duplicate(@car21)
              dup_c21.save

              dup_c22 = dup_c21.children[0]
              dup_c23 = dup_c22.children[0]
              dup_c24 = dup_c21.children[1]
              dup_c25 = dup_c24.children[0]
              dup_c26 = dup_c21.children[2]

              # Check that data is duplicated correctly, duplicates not the same object
              expect(dup_c21.data).to eq(@car21.data)
              expect(dup_c22.data).to eq(@car22.data)
              expect(dup_c23.data).to eq(@car23.data)
              expect(dup_c24.data).to eq(@car24.data)
              expect(dup_c25.data).to eq(@car25.data)
              expect(dup_c26.data).to eq(@car26.data)
              expect(dup_c21).to_not be(@car21)
              expect(dup_c22).to_not be(@car22)
              expect(dup_c23).to_not be(@car23)
              expect(dup_c24).to_not be(@car24)
              expect(dup_c25).to_not be(@car25)
              expect(dup_c26).to_not be(@car26)

              # Check associations
              # dup_c21's children
              expect(dup_c21.children.size).to eq(3)
              expect(dup_c21.children).to include(dup_c22)
              expect(dup_c21.children).to include(dup_c24)
              expect(dup_c21.children).to include(dup_c26)
              # dup_c22's children
              expect(dup_c22.children.size).to eq(1)
              expect(dup_c22.children).to include(dup_c23)
              # dup_c23's children
              expect(dup_c23.children.size).to eq(0)
              # dup_c24's children
              expect(dup_c24.children.size).to eq(1)
              expect(dup_c24.children).to include(dup_c25)
              # dup_c25's children
              expect(dup_c25.children.size).to eq(0)
              # dup_c26's children
              expect(dup_c26.children.size).to eq(1)
              expect(dup_c26.children).to include(dup_c25)
            end
          end

          context 'with exclusions' do
            it 'duplicates ComplexActiveRecord object but not excluded children' do
              duplicator = Duplicator.new([@car24, @car26])
              dup_c21 = duplicator.duplicate(@car21)

              dup_c22 = dup_c21.children[0]
              dup_c23 = dup_c22.children[0]

              expect(dup_c21.data).to eq(21)
              expect(dup_c22.data).to eq(22)
              expect(dup_c23.data).to eq(23)
              expect(dup_c21).to_not be(@car21)
              expect(dup_c22).to_not be(@car22)
              expect(dup_c23).to_not be(@car23)
              expect(dup_c21.children.size).to eq(1)
              expect(dup_c22.children.size).to eq(1)
            end

            it 'partially duplicates objects when some children are excluded' do
              duplicator = Duplicator.new([@car22, @car25])
              dup_c21 = duplicator.duplicate(@car21)

              dup_c24 = dup_c21.children[0]
              dup_c26 = dup_c21.children[1]

              expect(dup_c21.data).to eq(21)
              expect(dup_c24.data).to eq(24)
              expect(dup_c26.data).to eq(26)
              expect(dup_c21).to_not be(@car21)
              expect(dup_c24).to_not be(@car24)
              expect(dup_c26).to_not be(@car26)
              expect(dup_c21.children.size).to eq(2)
              expect(dup_c24.children.size).to eq(0)
              expect(dup_c26.children.size).to eq(0)
            end
          end
        end

        context 'when ComplexActiveRecord object graphs are duplicated' do
          before(:each) do
            create_ar_cyclic_graph
          end

          context 'with cycles' do
            it 'duplicates cyclic two object graph' do
              c1 = ComplexActiveRecord.create(data: 51)
              c2 = c1.children.create(data: 52)
              c2.children << c1

              duplicator = Duplicator.new
              dup_c1 = duplicator.duplicate(c1)
              dup_c2 = dup_c1.children[0]

              # check that objects are duplicated
              expect(dup_c1.data).to eq(c1.data)
              expect(dup_c1).to_not be(c1)
              expect(dup_c2.data).to eq(c2.data)
              expect(dup_c2).to_not be(c2)
              # check associations
              expect(dup_c1.children).to include(dup_c2)
              expect(dup_c2.children).to include(dup_c1)
              expect(dup_c1.children).to_not include(c2)
              expect(dup_c2.children).to_not include(c1)
            end

            it 'duplicates cyclic graph' do
              duplicator = Duplicator.new

              # Check that number of objects increased
              expect do
                @dup_c1 = duplicator.duplicate(@car1)
                @dup_c1.save
              end.to change { ComplexActiveRecord.count }.by(6)

              # init some variables for easier checking
              dup_c3 = @dup_c1.children[0].children[0]
              dup_c5 = dup_c3.children[0]
              dup_c4 = @dup_c1.children[0].children[1]

              # check cycle data
              expect(dup_c3.data).to eq(13)
              expect(dup_c4.data).to eq(14)
              expect(dup_c5.data).to eq(15)
              # check cycle associations
              expect(dup_c5.children[0]).to be(dup_c4)
              expect(dup_c4.children.size).to eq(2)
              expect(dup_c4.children).to include(dup_c3)
              expect(dup_c3.children).to include(dup_c5)
              expect(dup_c3.children.size).to eq(1)
            end

            it 'duplicates cyclic graph without c4' do
              duplicator = Duplicator.new([@car4])
              dup_c1 = duplicator.duplicate(@car1)
              dup_c1.save

              # should be left with c1 -> c2 -> c3 -> c5
              dup_c2 = dup_c1.children[0]
              dup_c3 = dup_c2.children[0]
              dup_c5 = dup_c3.children[0]

              # check nodes duplicated
              expect(dup_c1.data).to eq(@car1.data)
              expect(dup_c2.data).to eq(@car2.data)
              expect(dup_c3.data).to eq(@car3.data)
              expect(dup_c5.data).to eq(@car5.data)
              # check 1 child each
              expect(dup_c1.children.size).to eq(1)
              expect(dup_c2.children.size).to eq(1)
              expect(dup_c3.children.size).to eq(1)
              expect(dup_c5.children.size).to eq(0)
              # check the children
              expect(dup_c1.children).to include(dup_c2)
              expect(dup_c2.children).to include(dup_c3)
              expect(dup_c3.children).to include(dup_c5)
            end

            it 'duplicates sub-graph from c3' do
              duplicator = Duplicator.new
              dup_c3 = duplicator.duplicate(@car3)
              dup_c3.save

              # check cycle
              expect(dup_c3.children[0].children[0].children).to include(dup_c3)
            end

            it 'duplicates cyclic graph without c5' do
              duplicator = Duplicator.new([@car5])

              dup_c2 = duplicator.duplicate(@car2)
              dup_c3 = dup_c2.children[0]

              # check that @car3 has no children (because @car5 was excluded)
              expect(dup_c3.children).to be_empty
              expect(dup_c2.children[1].children).to include(dup_c3)
            end

            it 'duplicates cyclic graph without excluded tail c6' do
              duplicator = Duplicator.new([@car6])

              dup_c2 = duplicator.duplicate(@car2)
              dup_c4 = dup_c2.children[1]

              expect(dup_c4.data).to eq(@car4.data)
              expect(dup_c4.children.size).to eq(1)
            end
          end

          context 'when an array of objects are duplicated' do
            before(:each) do
              create_ar_graph
              @duplicator = Duplicator.new
            end

            it 'duplicates disjoint graphs' do
              duplicated_stuff = @duplicator.duplicate([@car1, @car21])

              expect(duplicated_stuff.length).to eq(2)
              expect(duplicated_stuff[0].data).to eq(@car1.data)
              expect(duplicated_stuff[0]).to_not be(@car1)
              expect(duplicated_stuff[1].data).to be(@car21.data)
              expect(duplicated_stuff[1]).to_not be(@car21)
            end

            it 'duplicates objects mentioned twice without creating extras' do
              duplicated_stuff = @duplicator.duplicate([@car2, @car3])

              dup_c3 = duplicated_stuff[0].children[0]

              expect(duplicated_stuff.length).to eq(2)
              expect(duplicated_stuff[0].data).to eq(@car2.data)
              expect(duplicated_stuff[0]).to_not be(@car2)
              expect(duplicated_stuff[1].data).to be(@car3.data)
              expect(duplicated_stuff[1]).to_not be(@car3)
              expect(duplicated_stuff[1]).to be(dup_c3)
            end
          end

          context 'when joined graphs are duplicated' do
            before(:each) do
              create_ar_graph
              # join graphs
              @car1.children << @car21

              @duplicator = Duplicator.new
            end

            it 'duplicates all objects' do
              dup_c1 = @duplicator.duplicate(@car1)
              dup_c1.save

              duplicated_objects = @duplicator.instance_variable_get(:@duplicated_objects)
              expect(duplicated_objects.length).to eq(12)
            end

            it 'duplicates cyclically joined graphs' do
              # join in the other direction
              @car21.children << @car1

              dup_c21 = @duplicator.duplicate(@car21)
              dup_c21.save

              duplicated_objects = @duplicator.instance_variable_get(:@duplicated_objects)
              expect(duplicated_objects.length).to eq(12)
            end
          end
        end
      end
    end
  end
end
