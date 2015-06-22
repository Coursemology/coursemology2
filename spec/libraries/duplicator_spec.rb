require 'rails_helper'

RSpec.describe Duplicator do
  class SimpleObject
    def initialize(id)
      @id = id
    end

    def duplicate(duplicator)
      self.clone
    end

    def ==(other)
      self.class == other.class && self.state == other.state
    end

    protected

    def state
      [@id]
    end
  end

  context 'when SimpleObject is duplicated' do

    before :each do
      @duplicator = Duplicator.new
      @obj_a = SimpleObject.new(2)
    end

    it 'is not duplicated if not in set' do
      duplicated_object = @duplicator.duplicate_object(@obj_a)
      expect(duplicated_object).to be_nil
    end

    it 'is duplicated if in set' do
      @duplicator.duplicate([@obj_a])
      duplicate_of_a = @duplicator.duplicate_of(@obj_a)

      expect(duplicate_of_a).to_not be_nil
      expect(duplicate_of_a).to_not be(@obj_a)
      expect(duplicate_of_a).to eq(@obj_a)
    end

    it 'is duplicated once' do
      @duplicator.duplicate([@obj_a])
      duplicate_of_a = @duplicator.duplicate_of(@obj_a)
      duplicate = @duplicator.duplicate_object(@obj_a)

      expect(duplicate).to_not be_nil
      expect(duplicate).to be(duplicate_of_a)
    end
  end

  context 'when ComplexObject is duplicated' do
    # ComplexObject has children
    class ComplexObject
      attr_reader :children

      def initialize(id, children)
        @id = id
        @children = children
      end

      def duplicate(duplicator)
        myself = self.clone
        new_children = Array.new

        @children.each do |child|
          new_child = duplicator.duplicate_object(child)
          new_children << new_child unless new_child.nil?
        end

        # example if object has no accessor for the children
        myself.instance_variable_set(:@children, new_children)
        myself
      end

      def ==(other)
        self.class == other.class && self.state == other.state
      end

      protected

      def state
        [@id, @children]
      end
    end

    before :each do
      @duplicator = Duplicator.new

      @s1 = SimpleObject.new(1)
      @s2 = SimpleObject.new(2)

      # setup 2 objects with overlapping children
      @c1 = ComplexObject.new(11, [@s1, @s2])
      @c2 = ComplexObject.new(12, [@s1])

      # setup an even more complicated object
      @c3 = ComplexObject.new(13, [@c1, @c2])
    end

    it 'duplicates objects in given list (no children)' do
      @duplicator.duplicate([@c1])
      dup_c1 = @duplicator.duplicate_of(@c1)

      expect(dup_c1.children).to be_empty
    end

    it 'duplicates objects in given list (all children)' do
      @duplicator.duplicate([@c1, @s1, @s2])
      dup_c1 = @duplicator.duplicate_of(@c1)

      orig_children = @c1.children
      dup_children = dup_c1.children

      # both children should be duplicated, same values, different objects
      expect(dup_children.length).to be(2)
      expect(orig_children).to eq(dup_children)
      expect(orig_children).to_not be(dup_children)
    end

    it 'duplicates objects referenced in 2 places once' do
      @duplicator.duplicate([@c1, @c2, @s1, @s2])
      dup_c1 = @duplicator.duplicate_of(@c1)
      dup_c2 = @duplicator.duplicate_of(@c2)

      expect(dup_c1.children[0]).to be(dup_c2.children[0])
    end

    it 'duplicates objects with ComplexObject children' do
      @duplicator.duplicate([@c3, @c1, @c2, @s1, @s2])
      dup_c3 = @duplicator.duplicate_of(@c3)

      expect(dup_c3.children.length).to be(2)
      expect(dup_c3.children[0]).to eq(@c1)
      expect(dup_c3.children[1]).to eq(@c2)
      expect(dup_c3.children[0]).to_not be(@c1)
      expect(dup_c3.children[1]).to_not be(@c2)
    end

    it 'partially duplicates objects when not all children are in list' do
      pending('implementation')
      fail
    end
  end
end
