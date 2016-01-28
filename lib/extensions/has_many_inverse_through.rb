# frozen_string_literal: true
# This adds primitive support for +:inverse_of+ in +has_many through:+ associations. This is
# useful for when a join association is polymorphic and cannot be be explicitly set on every join.
# This allows a record on the other end of the association chain to be added with the join
# record, and no duplicate join record would be created.
#
# @example has_many through, when products has_one polymorphic product
#   has_many :pens, through: :products, source_type: Pen.name, inverse_through: :product
module Extensions::HasManyInverseThrough; end
