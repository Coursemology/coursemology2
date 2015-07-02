require 'rails_helper'

RSpec.describe Duplicator, type: :model do
  class SimpleObject
    def initialize(id)
      @id = id
    end

    def initialize_duplicate(_duplicator)
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
    attr_reader :children

    def initialize(id, children)
      @id = id
      @children = children
    end

    def initialize_duplicate(duplicator)
      new_children = []

      @children.each do |child|
        new_child = duplicator.duplicate(child)
        new_children << new_child unless new_child.nil?
      end

      # example if object has no accessor for the children
      # self is already duplicated by Duplicator. Find the duplicated version
      duplicator.duplicate(self).instance_variable_set(:@children, new_children)
    end

    def ==(other)
      self.class == other.class && state == other.state
    end

    protected

    def state
      [@id, @children]
    end
  end

  def create_complex_objects
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
    #       ------> c3 ---
    #       |       ^    |
    # c1 -> c2      |    -> c5
    #       |       |       |
    #       ------> c4 <-----
    #               |
    #               -----> s1
    #
    @s1 = SimpleObject.new(1)
    @c4 = ComplexObject.new(14, [])      # assign children later
    @c5 = ComplexObject.new(15, [@c4])
    @c3 = ComplexObject.new(13, [@c5])
    @c2 = ComplexObject.new(12, [@c3, @c4])
    @c1 = ComplexObject.new(11, [@c2])

    @c4.instance_variable_set(:@children, [@s1, @c3])   # create cycle
  end

  def create_second_cyclic_graph
    #
    #      ----> c22 <--
    #      |      |    |
    # c21 --      |    |
    #      |      |--> |
    #      ----------> c23
    #
    @c22 = ComplexObject.new(22, [])  # assign children later
    @c23 = ComplexObject.new(23, [@c22])
    @c21 = ComplexObject.new(21, [@c22, @c23])

    @c22.instance_variable_set(:@children, [@c23])
  end

  class SimpleActiveRecord < ActiveRecord::Base
    def initialize_duplicate(_duplicator)
    end

    def ==(other)
      self.class == other.class && state == other.state
    end

    protected

    def state
      [@data]
    end
  end

  temporary_table(:simple_active_records) do |t|
    t.integer :data
  end

  class ComplexActiveRecord < ActiveRecord::Base
    has_and_belongs_to_many :children, class_name: 'ComplexActiveRecord',
                            foreign_key: 'parent_id', join_table: :children_parents,
                            association_foreign_key: 'children_id'
    has_and_belongs_to_many :parents, class_name: 'ComplexActiveRecord',
                            foreign_key: 'children_id', join_table: :children_parents,
                            association_foreign_key: 'parent_id'

    def initialize_duplicate(duplicator)
      new_children = []

      self.children.each do |child|
        new_child = duplicator.duplicate(child)
        new_children << new_child unless new_child.nil?
      end

      duplicator.duplicate(self).children = new_children
    end

    def ==(other)
      self.class == other.class && state == other.state
    end

    def state
      [@data, self.children]
    end
  end

  temporary_table(:complex_active_records) do |t|
    t.integer :data
  end

  temporary_table(:children_parents) do |t|
    t.integer :children_id, foreign_key: { references: :complex_active_records, primary_key: :id }
    t.integer :parent_id, foreign_key: { references: :complex_active_records, primary_key: :id }
  end

  context 'when SimpleObject is duplicated' do
    before :each do
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

  context 'when ComplexObject is duplicated without exclusions' do
    before :each do
      create_complex_objects
      @duplicator = Duplicator.new
    end

    it 'duplicates object' do
      dup_c1 = @duplicator.duplicate(@c1)

      orig_children = @c1.children
      dup_children = dup_c1.children

      expect(dup_c1).to eq(@c1)
      expect(dup_c1).to_not be(@c1)

      # both children should be duplicated, same values, different objects
      expect(dup_children.length).to be(2)
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

      expect(dup_c3.children.length).to be(3)
      expect(dup_c3.children[0]).to eq(@c1)
      expect(dup_c3.children[1]).to eq(@c2)
      expect(dup_c3.children[0]).to_not be(@c1)
      expect(dup_c3.children[1]).to_not be(@c2)
    end
  end

  context 'when objects are excluded' do
    before :each do
      create_complex_objects
    end

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

      expect(dup_c3.children.length).to be(2)
      expect(dup_c1_children.length).to be(1)
      expect(dup_c1_children[0]).to eq(@s1)
      expect(dup_c1_children[0]).to_not be(@s1)
    end
  end

  context 'when object graph has cycles' do
    before :each do
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
      expect(duplicator.instance_variable_get(:@duplicated_objects).length).to be(2)
      expect(dup_c1.children[0].children[0]).to be(dup_c1)
    end

    it 'duplicates graph with 2 object cycle' do
      # a -> b -> c -> d
      #      ^----|
      c4 = ComplexObject.new(14, [])
      c3 = ComplexObject.new(13, [])  # still incomplete
      c2 = ComplexObject.new(12, [c3])
      c1 = ComplexObject.new(11, [c2])
      c3.instance_variable_set(:@children, [c2, c4])
      duplicator = Duplicator.new
      dup_c1 = duplicator.duplicate(c1)

      dup_c2 = dup_c1.children[0]
      dup_c3 = dup_c2.children[0]

      expect(duplicator.instance_variable_get(:@duplicated_objects).length).to be(4)
      expect(dup_c1).to eq(c1)
      expect(dup_c1).to_not be(c1)
      expect(dup_c3.children[0]).to be(dup_c2)
    end

    it 'duplicates cyclic graph' do
      duplicator = Duplicator.new
      dup_c1 = duplicator.duplicate(@c1)

      expect(dup_c1).to eq(@c1)
      expect(dup_c1).to_not be(@c1)
    end

    it 'duplicates cyclic graph without excluded tail' do
      duplicator = Duplicator.new([@s1])
      dup_c1 = duplicator.duplicate(@c1)

      # get original and duplicated node c4
      c4 = @c1.children[0].children[1]
      dup_c4 = dup_c1.children[0].children[1]

      expect(dup_c1).to_not eq(@c1)
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

      expect(dup_c1.children.length).to be(1)
      expect(dup_c2.children.length).to be(1)
      expect(dup_c3.children.length).to be(1)
      expect(dup_c5.children.length).to be(0)
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
    before :each do
      create_cyclic_graph
      create_second_cyclic_graph
    end

    it 'duplicates objects mentioned twice without creating extras' do
      duplicator = Duplicator.new
      duplicated_stuff = duplicator.duplicate([@c1, @c3])

      dup_c3 = duplicated_stuff[0].children[0].children[0]

      expect(duplicated_stuff.length).to be(2)
      expect(duplicated_stuff[0]).to eq(@c1)
      expect(duplicated_stuff[0]).to_not be(@c1)
      expect(duplicated_stuff[1]).to eq(@c3)
      expect(duplicated_stuff[1]).to_not be(@c3)
      expect(duplicated_stuff[1]).to be(dup_c3)
    end

    it 'duplicates disjoint graphs' do
      duplicator = Duplicator.new
      duplicated_stuff = duplicator.duplicate([@c1, @c21])

      expect(duplicated_stuff.length).to be(2)
      expect(duplicated_stuff[0]).to eq(@c1)
      expect(duplicated_stuff[0]).to_not be(@c1)
      expect(duplicated_stuff[1]).to eq(@c21)
      expect(duplicated_stuff[1]).to_not be(@c21)
    end

    it 'duplicates disjoint graphs and excludes objects' do
      duplicator = Duplicator.new([@c4, @c23])
      duplicator.duplicate([@c1, @c21])

      duplicated_objects = duplicator.instance_variable_get(:@duplicated_objects)

      # @s1 is not reached, @c4 and @c23 are reached by not duplicated
      expect(duplicated_objects.length).to be(8)
      expect(duplicated_objects[@c4]).to be_nil
      expect(duplicated_objects[@c23]).to be_nil
    end
  end

  context 'when joined graphs are duplicated' do
    before :each do
      create_cyclic_graph
      create_second_cyclic_graph
      # join graphs
      c1_children = @c1.children
      c1_children << @c21
      @c1.instance_variable_set(:@children, c1_children)
    end

    it 'duplicates all objects' do
      duplicator = Duplicator.new
      duplicator.duplicate(@c1)

      duplicated_objects = duplicator.instance_variable_get(:@duplicated_objects)
      expect(duplicated_objects.length).to be(9)
    end

    it 'duplicates cyclically joined graphs' do
      duplicator = Duplicator.new
      # join from c21 to c1
      c21_children = @c21.children
      c21_children << @c1
      @c21.instance_variable_set(:@children, c21_children)
      duplicator.duplicate(@c21)

      duplicated_objects = duplicator.instance_variable_get(:@duplicated_objects)
      expect(duplicated_objects.length).to be(9)
    end

    it 'excludes excluded objects' do
      duplicator = Duplicator.new([@s1])
      duplicator.duplicate(@c1)

      duplicated_objects = duplicator.instance_variable_get(:@duplicated_objects)
      expect(duplicated_objects[@s1]).to be_nil
    end
  end

  context 'when SimpleActiveRecord objects are duplicated' do
    before :each do
      @sar_1 = SimpleActiveRecord.new(data: 1)
      @sar_1.save
    end

    with_temporary_table(:simple_active_records) do
      it 'duplicates a record' do
        duplicator = Duplicator.new
        duplicator.duplicate(@sar_1).save

        all_records = SimpleActiveRecord.all

        expect(SimpleActiveRecord.count).to be(2)
        expect(all_records[0]).to eq(all_records[1])
        expect(all_records[0].id).to_not eq(all_records[1].id)
      end

      it 'is not duplicated if excluded' do
        duplicator = Duplicator.new([@sar_1])
        dup_sar_1 = duplicator.duplicate(@sar_1)

        expect(dup_sar_1).to be_nil
        expect(SimpleActiveRecord.count).to be(1)
      end

      it 'is duplicated once' do
        duplicator = Duplicator.new
        duplicator.duplicate(@sar_1).save
        duplicator.duplicate(@sar_1).save

        expect(SimpleActiveRecord.count).to be(2)
      end
    end
  end

  # ComplexActiveRecord objects have associations to themselves
  context 'when ComplexActiveRecord objects are duplicated' do
    #self.use_transactional_fixtures = false
    with_temporary_table(:complex_active_records) do
      with_temporary_table(:children_parents) do
        it 'duplicates a ComplexActiveRecord object' do
          # create object and some children
          c1 = ComplexActiveRecord.new(data: 11)
          c1.save
          c1.children.create({data: 12})
          c1.children.create({data: 13})

          # duplicate object
          duplicator = Duplicator.new
          dup_c1 = duplicator.duplicate(c1)
          dup_c1.save

          # tests
          expect(ComplexActiveRecord.count).to be(6)
          expect(c1).to eq(dup_c1)
          expect(c1).to_not be(dup_c1)
          # both children should be duplicated, same values, different objects
          (0..1).each do |i|
            expect(c1.children[i]).to eq(dup_c1.children[i])
            expect(c1.children[i]).to_not be(dup_c1.children[i])
          end
        end

        it 'duplicates object referenced in 2 places once' do
          #
          # c1--|
          #     |---> c5
          # c2--|
          #
          c1 = ComplexActiveRecord.new(data: 11)
          c2 = ComplexActiveRecord.new(data: 12)
          c1.save
          c2.save
          c1.children.create({data: 15})
          c2.children = c1.children

          duplicator = Duplicator.new
          dup_c1 = duplicator.duplicate(c1)
          dup_c1.save
          dup_c2 = duplicator.duplicate(c2)
          dup_c2.save

          expect(ComplexActiveRecord.count).to be(6)
          expect(dup_c1.children[0]).to be(dup_c2.children[0])
          expect(dup_c1.children[0].data).to be(15)
        end

        # stuck here because c3 never gets duplicated
        it 'duplicates multi-layer graphs' do
          #
          #  c1 ---> c2 ---- > c3
          #     ----> c4 ----> c5
          #     ----> c6
          #
          c1 = ComplexActiveRecord.new(data: 11)
          c1.save
          c2 = c1.children.create({data: 12})
          c3 = c2.children.create({data: 13})
          c4 = c1.children.create({data: 14})
          c5 = c4.children.create({data: 15})
          c6 = c1.children.create({data: 16})
#          c6.children = c4.children

          duplicator = Duplicator.new
          dup_c1 = duplicator.duplicate(c1)
          dup_c1.save
          p dup_c1.children[0].children[0]

#          byebug
          expect(ComplexActiveRecord.count).to be(12)
        end


      end
    end
  end
end
