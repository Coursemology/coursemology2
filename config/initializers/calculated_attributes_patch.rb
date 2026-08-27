# frozen_string_literal: true
# Neutralises an upstream regression in `calculated_attributes` v1.2.0.
#
# ## Why this exists
#
# The Rails 8.1 hop required bumping `calculated_attributes` to v1.2.0 (`992fdd9`) — the first ref
# shipping `rails_8_1_patches.rb`. The gem requires its patch file by exact Rails version
# (`rails_#{MAJOR}_#{MINOR}_patches`), so any older ref raises `LoadError` at boot on 8.1.
#
# That bump also brings commit 9cfea61 ("Support .count on relations that have previously had
# `calculated` applied", 2026-05-14), which adds an override of `ActiveRecord::Relation#calculate`:
#
#     module ActiveRecord
#       class Relation
#         def calculated(*args) ... end
#
#         private                                   # <- (1)
#
#         def calculate(operation, column_name)
#           self.select_values = [] if select_values.any? { |p| ... p.calculated_attr? }   # <- (2)
#           super
#         end
#       end
#     end
#
# It breaks us in two independent ways:
#
# 1. **Wrong visibility → infinite recursion.** `calculate` is public API on Relation, and
#    `ActiveRecord::Querying` delegates it to the relation (`delegate :calculate, ..., to: :all`).
#    Demoting it to private means the delegation cannot dispatch, so the call falls through to
#    `Relation#method_missing`, which delegates straight back to the class:
#
#        Querying#calculate -> all.calculate -> method_missing -> klass.public_send(:calculate)
#          -> Querying#calculate -> ...        =>  SystemStackError
#
# 2. **Clearing `select_values` breaks `ORDER BY <calculated alias>`.** Even with the visibility
#    fixed, wiping the select list drops the calculated projection while the ORDER BY still
#    references its alias, producing `PG::UndefinedColumn`. The wipe is done *in place*
#    (`self.select_values = []`), so it corrupts the relation for later use — the query that
#    actually failed was not the `count` but the record load that followed it.
#
#    **This second break is no longer load-bearing here.** The four leaderboard scopes in
#    `Course::Group` / `CourseUser` now order by the underlying SQL expression, via
#    `ApplicationRecord.calculated_expression`, instead of by the alias. That is self-contained and
#    survives a wiped select list; verified by running those specs with this file disabled. Removing
#    the override still matters for keeping the calculated values *selected* (otherwise each record
#    lazily re-queries its own attribute, an N+1), and break (1) is fatal regardless.
#
# Neither problem is Rails-8.1-specific; they simply arrived with the ref bump. There is no
# upstream ref that has the 8.1 patches without them — the regression (9cfea61, 2026-05-14)
# predates the 8.1 support commit (464fd11, 2026-05-29).
#
# ## What this does
#
# Removes the gem's override so `ActiveRecord::Calculations#calculate` is used again. That restores
# the exact behaviour of v1.1.1 (`ecaf6c9`), the ref we ran in production, while keeping v1.2.0's
# `rails_8_1_patches.rb`, which is the only reason we bumped. The only thing given up is the
# upstream `.count`-after-`calculated` support added in 9cfea61 — which we never had.
#
# The guard makes this a no-op if a future version drops or relocates the override, so a later gem
# bump degrades to "does nothing" rather than silently removing a fixed implementation. Revisit
# this file on any `calculated_attributes` bump; delete it once upstream is fixed.
ActiveSupport.on_load(:active_record) do
  definition = ActiveRecord::Relation.instance_method(:calculate).source_location&.first

  ActiveRecord::Relation.send(:remove_method, :calculate) if definition&.include?('calculated_attributes')
end
