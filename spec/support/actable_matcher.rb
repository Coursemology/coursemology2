require 'rspec/expectations'

RSpec::Matchers.define :be_actable do
  match do |subject|
    @class = subject.class
    @actable_association = actable_association
    actable_association_exists? &&
      actable_association_belongs_to? &&
      actable_association_polymorphic? &&
      @class.actable?
  end

  def actable_association
    @class.reflect_on_all_associations.find { |r| r.name == :actable }
  end

  def actable_association_exists?
    !@actable_association.nil?
  end

  def actable_association_belongs_to?
    @actable_association.macro == :belongs_to
  end

  def actable_association_polymorphic?
    @actable_association.polymorphic?
  end
end
