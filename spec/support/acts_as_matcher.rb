require 'rspec/expectations'

RSpec::Matchers.define :acts_as do |actable|
  match do |subject|
    @class = subject.class
    @actable = actable
    @actable_association = actable_association
    @actable_class = actable_association.klass

    actable_association_exists? &&
      actable_association_has_one? &&
      subject_inherits? &&
      subject_acting_as?
  end

  def actable_association
    is_actable_association =
      if @actable_class_name
        ->(r) { r.class_name == @actable_class_name }
      else
        ->(r) { r.name == @actable }
      end
    @class.reflect_on_all_associations.find(&is_actable_association)
  end

  def actable_association_exists?
    !@actable_association.nil?
  end

  def actable_association_has_one?
    @actable_association.macro == :has_one
  end

  def subject_inherits?
    @class.is_a? @actable_class
  end

  def subject_acting_as?
    subject.acting_as? @actable_class
  end

  chain :class_name do |class_name|
    @actable_class_name = class_name
  end
end
