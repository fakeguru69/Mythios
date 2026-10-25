-- 0136: the party chat's badge notice never doubles an article ("the The Whole Table").
\set P '22222222-2222-2222-2222-222222222222'
select 'no doubled article in the function (expect t)', pg_get_functiondef('public.check_member_big_moments(uuid,uuid)'::regprocedure) not like '%earned the '' || v_b_title%';
select 'the rule (expect "The party earned The Whole Table badge." / "Mei earned the Perfect badge.")',
  'The party earned ' || case when t ~ '^(The|A) ' then t else 'the ' || t end || ' badge.',
  'Mei earned ' || case when u ~ '^(The|A) ' then u else 'the ' || u end || ' badge.'
from (values ('The Whole Table', 'Perfect')) v(t, u);
