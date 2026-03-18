SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict iy140hAMm2gFOspuvFdCi9cEz1hbrxLRATTwGoHe6KZdCq0bCF3hHdSE1Dr4emT

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."flow_state" ("id", "user_id", "auth_code", "code_challenge_method", "code_challenge", "provider_type", "provider_access_token", "provider_refresh_token", "created_at", "updated_at", "authentication_method", "auth_code_issued_at") VALUES
	('247303f3-60f8-464f-8b9c-e8a479de54cc', '0b690928-fdac-4ea4-847f-5190521ddfe0', '00493e17-ee43-4097-b012-d8143578e0f2', 's256', 'ZmipqFyWyBVHBls2v_h0ExNF_42HT4c5XFpgc_jwvSQ', 'email', '', '', '2025-12-08 15:56:53.173111+00', '2025-12-08 16:04:17.032787+00', 'email/signup', '2025-12-08 16:04:17.032747+00'),
	('4d665b30-6bcd-4831-8822-a9f2bb76dc4b', 'b8b05d96-4496-4724-b527-199b7db8d848', 'f0e18932-5b33-49d0-8ff1-c1c569fa0f3c', 's256', 'AniQBcrIUav0X9KOzuxduQVFiKxtuCuYdq6YwNIIg9Y', 'email', '', '', '2025-12-08 18:58:18.406088+00', '2025-12-08 19:06:36.968998+00', 'email/signup', '2025-12-08 19:06:36.968962+00'),
	('73b743bd-7078-4972-a5a8-9743d3a9a797', '30d04492-d7dc-4fe8-8686-96b21d006170', 'd39d7977-30cf-41b2-badd-36c63927e32f', 's256', 'FzrxfGrFt1gsu5TqcgsOiKBGv0gwe_lKol7saSpOXVE', 'email', '', '', '2025-12-08 19:13:35.847291+00', '2025-12-08 19:14:00.500711+00', 'email/signup', '2025-12-08 19:14:00.500669+00');


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'system@scout-hub.local', '$2a$06$nQzOxiH7/JFFxjMJdO0ceOQAQW3v.GnYHDhUPub8zYmJC5zsJh79.', '2025-12-04 22:30:22.953499+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "System User"}', false, '2025-12-04 22:30:22.953499+00', '2025-12-04 22:30:22.953499+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '5ba4f970-d952-4b4e-9470-c021e3efd767', 'authenticated', 'authenticated', 'provinceadmin@test.com', '$2a$10$Ee7pPY3kJe80ax2wmqvM6.xzrFJQOv6qpQ2U3BrcYoKCuMcopzmde', '2025-12-04 23:56:18.503126+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-12-08 10:14:09.972918+00', '{"provider": "email", "providers": ["email"]}', '{"full_name": "Province Test Admin", "email_verified": true}', NULL, '2025-12-04 23:56:18.49693+00', '2025-12-08 16:18:35.412238+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'b8b05d96-4496-4724-b527-199b7db8d848', 'authenticated', 'authenticated', 'ruairi.mcnicholas@finsweet.com', '$2a$10$TuatwDr7w0973B91oD.kFu10aOT3DqhC0.cBATYgRQCdv94I6qTBe', '2025-12-08 19:06:36.962416+00', NULL, '', '2025-12-08 18:58:18.406996+00', '', NULL, '', '', NULL, '2025-12-08 19:09:42.39806+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "b8b05d96-4496-4724-b527-199b7db8d848", "email": "ruairi.mcnicholas@finsweet.com", "full_name": "Ruairi McNicholas", "last_name": "McNicholas", "first_name": "Ruairi", "email_verified": true, "phone_verified": false}', NULL, '2025-12-08 18:58:18.396783+00', '2025-12-08 19:09:42.416182+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '0b690928-fdac-4ea4-847f-5190521ddfe0', 'authenticated', 'authenticated', 'kilcoonaventures@gmail.com', '$2a$10$R8Dnb.VbrhaiL0DbsyWriOW.xETSb8JSM3AUXF7./ZMJlO622rp8K', '2025-12-08 16:04:17.025057+00', NULL, '', '2025-12-08 15:56:53.179377+00', '', NULL, '', '', NULL, '2025-12-08 19:22:46.504125+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "0b690928-fdac-4ea4-847f-5190521ddfe0", "email": "kilcoonaventures@gmail.com", "full_name": "Sean McCormack", "email_verified": true, "phone_verified": false}', NULL, '2025-12-08 15:56:53.149371+00', '2025-12-09 14:43:32.308576+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '30d04492-d7dc-4fe8-8686-96b21d006170', 'authenticated', 'authenticated', 'kilcoonacubs@gmail.com', '$2a$10$TZfTwphoxsrpN7ckSOrwkeW.AGT.38R1zl4emdTl.zWq4fovHuc.m', '2025-12-08 19:14:00.49613+00', NULL, '', '2025-12-08 19:13:35.848468+00', '', NULL, '', '', NULL, '2025-12-08 20:18:17.084911+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "30d04492-d7dc-4fe8-8686-96b21d006170", "email": "kilcoonacubs@gmail.com", "full_name": "Ruairi McNicholas", "last_name": "McNicholas", "first_name": "Ruairi", "email_verified": true, "phone_verified": false}', NULL, '2025-12-08 19:13:35.837232+00', '2025-12-09 15:08:53.081702+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', 'authenticated', 'authenticated', 'ruairimcn@protonmail.com', '$2a$10$F8Gv7gVf96l2OGFSYQV8i.WccDfBg3GF3qrFA2Wcb15PBKdEfMIr2', '2025-12-04 23:00:11.989684+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-12-08 20:07:03.675583+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-12-04 23:00:11.98222+00', '2025-12-09 16:54:56.538904+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('6d63d9e6-316c-4b29-bf6b-7ff03b623328', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', '{"sub": "6d63d9e6-316c-4b29-bf6b-7ff03b623328", "email": "ruairimcn@protonmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-12-04 23:00:11.984454+00', '2025-12-04 23:00:11.984507+00', '2025-12-04 23:00:11.984507+00', 'ca4381eb-638d-40f3-baff-2e622fe299e0'),
	('5ba4f970-d952-4b4e-9470-c021e3efd767', '5ba4f970-d952-4b4e-9470-c021e3efd767', '{"sub": "5ba4f970-d952-4b4e-9470-c021e3efd767", "email": "provinceadmin@test.com", "email_verified": false, "phone_verified": false}', 'email', '2025-12-04 23:56:18.500448+00', '2025-12-04 23:56:18.500516+00', '2025-12-04 23:56:18.500516+00', '8b5ac030-4992-4ad8-a4bb-a62ef181d8fc'),
	('0b690928-fdac-4ea4-847f-5190521ddfe0', '0b690928-fdac-4ea4-847f-5190521ddfe0', '{"sub": "0b690928-fdac-4ea4-847f-5190521ddfe0", "email": "kilcoonaventures@gmail.com", "full_name": "Sean McCormack", "email_verified": true, "phone_verified": false}', 'email', '2025-12-08 15:56:53.166384+00', '2025-12-08 15:56:53.166442+00', '2025-12-08 15:56:53.166442+00', '8e819033-7c41-4fee-b332-ebd1ba3fe82d'),
	('b8b05d96-4496-4724-b527-199b7db8d848', 'b8b05d96-4496-4724-b527-199b7db8d848', '{"sub": "b8b05d96-4496-4724-b527-199b7db8d848", "email": "ruairi.mcnicholas@finsweet.com", "full_name": "Ruairi McNicholas", "last_name": "McNicholas", "first_name": "Ruairi", "email_verified": true, "phone_verified": false}', 'email', '2025-12-08 18:58:18.402263+00', '2025-12-08 18:58:18.402325+00', '2025-12-08 18:58:18.402325+00', 'd2ced9c0-efd5-4985-aca7-ee7d8b130130'),
	('30d04492-d7dc-4fe8-8686-96b21d006170', '30d04492-d7dc-4fe8-8686-96b21d006170', '{"sub": "30d04492-d7dc-4fe8-8686-96b21d006170", "email": "kilcoonacubs@gmail.com", "full_name": "Ruairi McNicholas", "last_name": "McNicholas", "first_name": "Ruairi", "email_verified": true, "phone_verified": false}', 'email', '2025-12-08 19:13:35.844434+00', '2025-12-08 19:13:35.844495+00', '2025-12-08 19:13:35.844495+00', 'a8235e1e-535d-4dea-84fa-cb3c3b02224d');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter") VALUES
	('59b8fb1a-0d9b-4331-bb33-3d2f542f70c5', '30d04492-d7dc-4fe8-8686-96b21d006170', '2025-12-08 19:14:11.783899+00', '2025-12-09 11:56:51.736677+00', NULL, 'aal1', NULL, '2025-12-09 11:56:51.736575', 'Vercel Edge Functions', '18.142.243.56', NULL, NULL, NULL, NULL),
	('a38ba8ab-f289-421b-9e41-2baf4db13a0c', '5ba4f970-d952-4b4e-9470-c021e3efd767', '2025-12-08 10:14:09.973013+00', '2025-12-08 16:18:35.413638+00', NULL, 'aal1', NULL, '2025-12-08 16:18:35.413549', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Safari/605.1.15', '184.82.123.135', NULL, NULL, NULL, NULL),
	('98b25be6-8224-4a29-b591-4d72fe5f3105', '0b690928-fdac-4ea4-847f-5190521ddfe0', '2025-12-08 19:22:46.504216+00', '2025-12-09 14:43:32.988951+00', NULL, 'aal1', NULL, '2025-12-09 14:43:32.988858', 'Vercel Edge Functions', '13.41.240.73', NULL, NULL, NULL, NULL),
	('8f0ae93e-b773-440c-8292-073512216fed', '30d04492-d7dc-4fe8-8686-96b21d006170', '2025-12-08 20:18:17.085007+00', '2025-12-09 15:08:53.083686+00', NULL, 'aal1', NULL, '2025-12-09 15:08:53.083597', 'Next.js Middleware', '184.82.123.135', NULL, NULL, NULL, NULL),
	('3278035b-c592-4de1-acac-8d51d75d1e87', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', '2025-12-08 20:07:03.675976+00', '2025-12-09 15:59:44.993467+00', NULL, 'aal1', NULL, '2025-12-09 15:59:44.993357', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '184.82.123.135', NULL, NULL, NULL, NULL),
	('dedcfbed-ab9e-4377-b074-7c2cbafcce70', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', '2025-12-08 19:14:22.225691+00', '2025-12-09 16:54:56.540923+00', NULL, 'aal1', NULL, '2025-12-09 16:54:56.540827', 'Vercel Edge Functions', '3.1.194.228', NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('a38ba8ab-f289-421b-9e41-2baf4db13a0c', '2025-12-08 10:14:09.987368+00', '2025-12-08 10:14:09.987368+00', 'password', 'e66c0a8d-6baf-4395-908b-89be608a1718'),
	('59b8fb1a-0d9b-4331-bb33-3d2f542f70c5', '2025-12-08 19:14:11.788395+00', '2025-12-08 19:14:11.788395+00', 'password', '161270ac-81c8-4920-9998-6e8483086d36'),
	('dedcfbed-ab9e-4377-b074-7c2cbafcce70', '2025-12-08 19:14:22.228059+00', '2025-12-08 19:14:22.228059+00', 'password', 'b89594ac-78f4-429a-b846-a14a3289a095'),
	('98b25be6-8224-4a29-b591-4d72fe5f3105', '2025-12-08 19:22:46.511164+00', '2025-12-08 19:22:46.511164+00', 'password', 'a9ed2e19-a648-4623-8dc1-d75a83afdbfc'),
	('3278035b-c592-4de1-acac-8d51d75d1e87', '2025-12-08 20:07:03.682975+00', '2025-12-08 20:07:03.682975+00', 'password', '108edfbd-6ebd-4875-94dc-dfcca417cfe8'),
	('8f0ae93e-b773-440c-8292-073512216fed', '2025-12-08 20:18:17.089968+00', '2025-12-08 20:18:17.089968+00', 'password', '32b9e0a7-7c9c-4094-bae2-dc4f21c098f9');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 64, 'lofiw2te5qdj', '30d04492-d7dc-4fe8-8686-96b21d006170', true, '2025-12-08 20:12:35.341966+00', '2025-12-09 10:53:58.306361+00', 'tda6abzlgjap', '59b8fb1a-0d9b-4331-bb33-3d2f542f70c5'),
	('00000000-0000-0000-0000-000000000000', 67, 'w5t2llksdo5g', '0b690928-fdac-4ea4-847f-5190521ddfe0', true, '2025-12-08 22:30:20.525137+00', '2025-12-09 10:58:04.83473+00', 'kvy7cxirfijj', '98b25be6-8224-4a29-b591-4d72fe5f3105'),
	('00000000-0000-0000-0000-000000000000', 73, 'g22fu2opshso', '30d04492-d7dc-4fe8-8686-96b21d006170', true, '2025-12-09 10:53:58.307371+00', '2025-12-09 11:56:51.732929+00', 'lofiw2te5qdj', '59b8fb1a-0d9b-4331-bb33-3d2f542f70c5'),
	('00000000-0000-0000-0000-000000000000', 75, 'wvxxldpmwsod', '30d04492-d7dc-4fe8-8686-96b21d006170', false, '2025-12-09 11:56:51.733645+00', '2025-12-09 11:56:51.733645+00', 'g22fu2opshso', '59b8fb1a-0d9b-4331-bb33-3d2f542f70c5'),
	('00000000-0000-0000-0000-000000000000', 70, 'lhfvkmfh6vkk', '30d04492-d7dc-4fe8-8686-96b21d006170', true, '2025-12-09 06:00:12.925562+00', '2025-12-09 12:06:44.370747+00', 'cdlj4ysazayk', '8f0ae93e-b773-440c-8292-073512216fed'),
	('00000000-0000-0000-0000-000000000000', 47, 'm2gfocmwu7bl', '5ba4f970-d952-4b4e-9470-c021e3efd767', true, '2025-12-08 14:45:22.892337+00', '2025-12-08 16:18:35.409884+00', 'xrv4j4scr6xe', 'a38ba8ab-f289-421b-9e41-2baf4db13a0c'),
	('00000000-0000-0000-0000-000000000000', 51, 'vcjpokawb2qe', '5ba4f970-d952-4b4e-9470-c021e3efd767', false, '2025-12-08 16:18:35.410932+00', '2025-12-08 16:18:35.410932+00', 'm2gfocmwu7bl', 'a38ba8ab-f289-421b-9e41-2baf4db13a0c'),
	('00000000-0000-0000-0000-000000000000', 72, 'lbk4oehjghob', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', true, '2025-12-09 07:03:47.515415+00', '2025-12-09 12:27:08.627069+00', 'min3u7k3qwz6', '3278035b-c592-4de1-acac-8d51d75d1e87'),
	('00000000-0000-0000-0000-000000000000', 71, 'jjbvlwd6w2bu', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', true, '2025-12-09 07:03:47.514829+00', '2025-12-09 12:39:26.06991+00', '4ykima2pobkl', 'dedcfbed-ab9e-4377-b074-7c2cbafcce70'),
	('00000000-0000-0000-0000-000000000000', 76, 'art326csctoz', '30d04492-d7dc-4fe8-8686-96b21d006170', true, '2025-12-09 12:06:44.371967+00', '2025-12-09 13:05:18.328492+00', 'lhfvkmfh6vkk', '8f0ae93e-b773-440c-8292-073512216fed'),
	('00000000-0000-0000-0000-000000000000', 77, '2g7lnnehetha', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', true, '2025-12-09 12:27:08.628501+00', '2025-12-09 13:57:34.575482+00', 'lbk4oehjghob', '3278035b-c592-4de1-acac-8d51d75d1e87'),
	('00000000-0000-0000-0000-000000000000', 79, 'tunfrv3oiiki', '30d04492-d7dc-4fe8-8686-96b21d006170', true, '2025-12-09 13:05:18.329238+00', '2025-12-09 14:04:11.949144+00', 'art326csctoz', '8f0ae93e-b773-440c-8292-073512216fed'),
	('00000000-0000-0000-0000-000000000000', 78, 'qdoz2s4q7fxx', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', true, '2025-12-09 12:39:26.071097+00', '2025-12-09 14:04:16.611815+00', 'jjbvlwd6w2bu', 'dedcfbed-ab9e-4377-b074-7c2cbafcce70'),
	('00000000-0000-0000-0000-000000000000', 74, '6ev6ecgew5wh', '0b690928-fdac-4ea4-847f-5190521ddfe0', true, '2025-12-09 10:58:04.83553+00', '2025-12-09 14:43:32.305057+00', 'w5t2llksdo5g', '98b25be6-8224-4a29-b591-4d72fe5f3105'),
	('00000000-0000-0000-0000-000000000000', 83, '464boplpbvy6', '0b690928-fdac-4ea4-847f-5190521ddfe0', false, '2025-12-09 14:43:32.306723+00', '2025-12-09 14:43:32.306723+00', '6ev6ecgew5wh', '98b25be6-8224-4a29-b591-4d72fe5f3105'),
	('00000000-0000-0000-0000-000000000000', 80, '56prl4yejgy6', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', true, '2025-12-09 13:57:34.576607+00', '2025-12-09 15:00:51.384943+00', '2g7lnnehetha', '3278035b-c592-4de1-acac-8d51d75d1e87'),
	('00000000-0000-0000-0000-000000000000', 81, 'qh46wvsy2nss', '30d04492-d7dc-4fe8-8686-96b21d006170', true, '2025-12-09 14:04:11.95054+00', '2025-12-09 15:08:53.079542+00', 'tunfrv3oiiki', '8f0ae93e-b773-440c-8292-073512216fed'),
	('00000000-0000-0000-0000-000000000000', 85, 'ck3jrqmzhxvv', '30d04492-d7dc-4fe8-8686-96b21d006170', false, '2025-12-09 15:08:53.080343+00', '2025-12-09 15:08:53.080343+00', 'qh46wvsy2nss', '8f0ae93e-b773-440c-8292-073512216fed'),
	('00000000-0000-0000-0000-000000000000', 60, 'tda6abzlgjap', '30d04492-d7dc-4fe8-8686-96b21d006170', true, '2025-12-08 19:14:11.785454+00', '2025-12-08 20:12:35.338216+00', NULL, '59b8fb1a-0d9b-4331-bb33-3d2f542f70c5'),
	('00000000-0000-0000-0000-000000000000', 82, '2pyhpgzkixlx', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', true, '2025-12-09 14:04:16.612245+00', '2025-12-09 15:20:36.387245+00', 'qdoz2s4q7fxx', 'dedcfbed-ab9e-4377-b074-7c2cbafcce70'),
	('00000000-0000-0000-0000-000000000000', 62, 'gp2a2wvhk3gx', '0b690928-fdac-4ea4-847f-5190521ddfe0', true, '2025-12-08 19:22:46.506432+00', '2025-12-08 21:14:33.261512+00', NULL, '98b25be6-8224-4a29-b591-4d72fe5f3105'),
	('00000000-0000-0000-0000-000000000000', 66, 'kvy7cxirfijj', '0b690928-fdac-4ea4-847f-5190521ddfe0', true, '2025-12-08 21:14:33.263044+00', '2025-12-08 22:30:20.524008+00', 'gp2a2wvhk3gx', '98b25be6-8224-4a29-b591-4d72fe5f3105'),
	('00000000-0000-0000-0000-000000000000', 65, 'zsuun6rvvhyc', '30d04492-d7dc-4fe8-8686-96b21d006170', true, '2025-12-08 20:18:17.087166+00', '2025-12-09 05:01:48.129084+00', NULL, '8f0ae93e-b773-440c-8292-073512216fed'),
	('00000000-0000-0000-0000-000000000000', 84, 'qdg4q3ameduh', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', true, '2025-12-09 15:00:51.386284+00', '2025-12-09 15:59:44.989205+00', '56prl4yejgy6', '3278035b-c592-4de1-acac-8d51d75d1e87'),
	('00000000-0000-0000-0000-000000000000', 63, '6chj5ngkhsx5', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', true, '2025-12-08 20:07:03.680193+00', '2025-12-09 05:03:05.160683+00', NULL, '3278035b-c592-4de1-acac-8d51d75d1e87'),
	('00000000-0000-0000-0000-000000000000', 87, 'yvyqnx623eca', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', false, '2025-12-09 15:59:44.990034+00', '2025-12-09 15:59:44.990034+00', 'qdg4q3ameduh', '3278035b-c592-4de1-acac-8d51d75d1e87'),
	('00000000-0000-0000-0000-000000000000', 68, 'cdlj4ysazayk', '30d04492-d7dc-4fe8-8686-96b21d006170', true, '2025-12-09 05:01:48.144683+00', '2025-12-09 06:00:12.923872+00', 'zsuun6rvvhyc', '8f0ae93e-b773-440c-8292-073512216fed'),
	('00000000-0000-0000-0000-000000000000', 61, '4ykima2pobkl', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', true, '2025-12-08 19:14:22.226755+00', '2025-12-09 07:03:47.505007+00', NULL, 'dedcfbed-ab9e-4377-b074-7c2cbafcce70'),
	('00000000-0000-0000-0000-000000000000', 69, 'min3u7k3qwz6', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', true, '2025-12-09 05:03:05.162394+00', '2025-12-09 07:03:47.504098+00', '6chj5ngkhsx5', '3278035b-c592-4de1-acac-8d51d75d1e87'),
	('00000000-0000-0000-0000-000000000000', 86, '6npc4ku33jkr', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', true, '2025-12-09 15:20:36.388029+00', '2025-12-09 16:54:56.536869+00', '2pyhpgzkixlx', 'dedcfbed-ab9e-4377-b074-7c2cbafcce70'),
	('00000000-0000-0000-0000-000000000000', 88, '5dizm3hrj4cw', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', false, '2025-12-09 16:54:56.537667+00', '2025-12-09 16:54:56.537667+00', '6npc4ku33jkr', 'dedcfbed-ab9e-4377-b074-7c2cbafcce70'),
	('00000000-0000-0000-0000-000000000000', 43, 'xrv4j4scr6xe', '5ba4f970-d952-4b4e-9470-c021e3efd767', true, '2025-12-08 10:14:09.982923+00', '2025-12-08 14:45:22.89019+00', NULL, 'a38ba8ab-f289-421b-9e41-2baf4db13a0c');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: adventure_teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."adventure_teams" ("id", "name", "slug", "description", "logo_url", "website", "email", "facebook_url", "instagram_url", "created_at", "updated_at", "deleted_at", "long_description", "stripe_account_id", "stripe_charges_enabled", "stripe_details_submitted") VALUES
	('e4f36777-7b8a-4682-8236-ddcb20f874c8', 'Backwoods Adventure Skills Team', 'backwoods-adventure-skills-team', 'The Backwoods team teaches and assesses the Backwoods skill.', 'https://kjezhjbxcfgmueqmdjiy.supabase.co/storage/v1/object/public/organization-logos/team/e4f36777-7b8a-4682-8236-ddcb20f874c8/1765206157501.jpg', NULL, 'backwoods@scouts.ie', 'https://www.facebook.com/BackwoodsScouter', NULL, '2025-12-08 14:52:25.06198+00', '2025-12-08 15:02:38.796622+00', NULL, '<p>The Backwoods team teaches and assesses the Backwoods skill.</p><p>They teach the new Scouting Ireland knife course.</p>', NULL, false, false),
	('fd76c3e4-f7ea-46d8-8bb3-8e889d5ef79e', 'Pioneering Adventure Skills Team', 'pioneering-adventure-skills-team', 'The Pioneering Adventure Skills Team runs the Pioneering program.', 'https://kjezhjbxcfgmueqmdjiy.supabase.co/storage/v1/object/public/organization-logos/team/fd76c3e4-f7ea-46d8-8bb3-8e889d5ef79e/1765278362670.jpg', NULL, 'pioneering@scouts.ie', 'https://www.facebook.com/SIPioneering', NULL, '2025-12-09 11:06:01.501228+00', '2025-12-09 11:06:04.218443+00', NULL, '<p>The Pioneering Adventure Skills Team runs the Pioneering program.</p>', NULL, false, false);


--
-- Data for Name: provinces; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."provinces" ("id", "name", "slug", "description", "logo_url", "website", "email", "facebook_url", "instagram_url", "created_at", "updated_at", "deleted_at", "long_description", "iban", "bic", "account_name", "stripe_account_id", "stripe_charges_enabled", "stripe_details_submitted") VALUES
	('60eed8cc-dc5c-44bb-bb13-ce2a38b420f9', 'Munster', 'munster', 'Scouting Ireland - Munster Province covering the southern region of Ireland', NULL, 'https://scouts.ie/munster', 'munster@scouts.ie', NULL, NULL, '2025-12-04 22:30:02.034763+00', '2025-12-08 00:29:18.518686+00', '2025-12-08 00:29:17.582+00', NULL, NULL, NULL, NULL, NULL, false, false),
	('5d6db586-8630-4ed0-9342-fc3bf95201f3', 'Connacht', 'connacht', 'Scouting Ireland - Connacht Province covering the western region of Ireland', NULL, 'https://scouts.ie/connacht', 'connacht@scouts.ie', NULL, NULL, '2025-12-04 22:30:02.034763+00', '2025-12-04 23:25:06.73628+00', '2025-12-04 23:25:06.662+00', '<p>This is the <strong>rich text description!!</strong></p>', NULL, NULL, NULL, NULL, false, false),
	('babdf52c-ffbe-4077-b8f8-eda6c942e1ff', '26th Galway Kilcoona', '26th-galway-kilcoona', 'Kilcoona Scout group in Galway', 'https://kjezhjbxcfgmueqmdjiy.supabase.co/storage/v1/object/public/organization-logos/province/babdf52c-ffbe-4077-b8f8-eda6c942e1ff/1764892014428.png', 'https://26thgalway.ie/', '26thgalwayscoutgroup@gmail.com', 'https://www.facebook.com/kilcoonascouts', NULL, '2025-12-04 23:46:54.133767+00', '2025-12-04 23:50:42.006168+00', '2025-12-04 23:50:41.944+00', '<p>We are a rural Scouting group that provide a fun, educational, community based scouting programme for the young people in our local area . We service a large community area including Claran, Headford, Annaghdown, Corrandulla, Caherlistrane, and Kilcoona .&nbsp;</p>', NULL, NULL, NULL, NULL, false, false),
	('4d88bb76-682b-4728-88d5-531d78e1d5ad', 'Ulster', 'ulster', 'Scouting Ireland - Ulster Province covering the northern region of Ireland', NULL, 'https://scouts.ie/ulster', 'ulster@scouts.ie', NULL, NULL, '2025-12-04 22:30:02.034763+00', '2025-12-08 00:28:24.081435+00', '2025-12-08 00:28:23.086+00', NULL, NULL, NULL, NULL, NULL, false, false),
	('f52429a2-8c70-4ef1-afb1-001ef292a0ae', 'Leinster', 'leinster', 'Scouting Ireland - Leinster Province covering the eastern region of Ireland', NULL, 'https://scouts.ie/leinster', 'leinster@scouts.ie', NULL, NULL, '2025-12-04 22:30:02.034763+00', '2025-12-08 00:28:40.955208+00', '2025-12-08 00:28:40.038+00', NULL, NULL, NULL, NULL, NULL, false, false),
	('7f4f6004-2124-47e0-931d-c40f7d71bea4', 'Western Province', 'western-province', 'Western Province: Clare, Galway, Lough Keel, Mayo, and Sligo.', 'https://kjezhjbxcfgmueqmdjiy.supabase.co/storage/v1/object/public/organization-logos/province/7f4f6004-2124-47e0-931d-c40f7d71bea4/1764891186275.png', 'https://www.westernprovincescouts.ie/', NULL, 'https://www.facebook.com/groups/134834853239239/user/100014230396593', NULL, '2025-12-04 23:33:05.236135+00', '2025-12-08 16:27:32.976368+00', NULL, '<p><strong>Western Province</strong> supports counties and groups based in the <strong>West of Ireland.</strong></p><p>These are</p><ul><li><p>Clare Scout County</p></li><li><p>Galway Scout County</p></li><li><p>Lough Keel Scout County</p></li><li><p>Mayo Scout County</p></li><li><p>Sligo Scout County</p></li></ul><p></p><p><a target="_blank" rel="noopener noreferrer" class="text-primary underline" href="https://www.facebook.com/profile.php?id=100014230396593">Facebook profile for Western Province</a><br><a target="_blank" rel="noopener noreferrer" class="text-primary underline" href="https://www.facebook.com/groups/httpswesternprovince.kpmedia.iehome">Facebook group for Western Province</a></p>', NULL, NULL, NULL, NULL, false, false);


--
-- Data for Name: counties; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."counties" ("id", "province_id", "name", "slug", "description", "logo_url", "website", "email", "facebook_url", "instagram_url", "created_at", "updated_at", "deleted_at", "long_description", "iban", "bic", "account_name", "stripe_account_id", "stripe_charges_enabled", "stripe_details_submitted") VALUES
	('a8dc9466-b1e5-45b5-954f-4544799db705', '7f4f6004-2124-47e0-931d-c40f7d71bea4', 'Mayo Scout County', 'mayo', 'Mayo Scout County', 'https://kjezhjbxcfgmueqmdjiy.supabase.co/storage/v1/object/public/organization-logos/county/a8dc9466-b1e5-45b5-954f-4544799db705/1765163921693.jpg', NULL, NULL, 'https://www.facebook.com/groups/1574608446197965', NULL, '2025-12-04 22:30:06.139138+00', '2025-12-08 03:19:06.191865+00', NULL, '<p>Mayo Scout County</p>', NULL, NULL, NULL, NULL, false, false),
	('e9f0de5f-70e3-4696-a69b-d896340255e6', '60eed8cc-dc5c-44bb-bb13-ce2a38b420f9', 'Tipperary', 'tipperary', 'Tipperary County Scouting', NULL, 'https://scouts.ie/tipperary', 'tipperary@scouts.ie', NULL, NULL, '2025-12-04 22:30:06.139138+00', '2025-12-08 03:19:39.09652+00', '2025-12-08 03:19:39.023+00', NULL, NULL, NULL, NULL, NULL, false, false),
	('0c2da9b4-8658-4130-b05c-00de231eebe5', '4d88bb76-682b-4728-88d5-531d78e1d5ad', 'Cavan', 'cavan', 'Cavan County Scouting', NULL, 'https://scouts.ie/cavan', 'cavan@scouts.ie', NULL, NULL, '2025-12-04 22:30:06.139138+00', '2025-12-08 01:20:52.593108+00', '2025-12-08 01:20:51.212+00', NULL, NULL, NULL, NULL, NULL, false, false),
	('a9ca7b0f-712a-42f3-9f64-406b985067ee', '60eed8cc-dc5c-44bb-bb13-ce2a38b420f9', 'Cork', 'cork', 'Cork County Scouting', NULL, 'https://scouts.ie/cork', 'cork@scouts.ie', NULL, NULL, '2025-12-04 22:30:06.139138+00', '2025-12-08 01:37:59.589539+00', '2025-12-08 01:37:58.231+00', NULL, NULL, NULL, NULL, NULL, false, false),
	('e25b77c0-4180-4cb2-846a-2a8cbfb44b57', '4d88bb76-682b-4728-88d5-531d78e1d5ad', 'Donegal', 'donegal', 'Donegal County Scouting', NULL, 'https://scouts.ie/donegal', 'donegal@scouts.ie', NULL, NULL, '2025-12-04 22:30:06.139138+00', '2025-12-08 01:44:10.439394+00', '2025-12-08 01:44:09.087+00', NULL, NULL, NULL, NULL, NULL, false, false),
	('27696f76-b5fa-4437-9427-5d25fa03b616', 'f52429a2-8c70-4ef1-afb1-001ef292a0ae', 'Dublin', 'dublin', 'Dublin County Scouting', NULL, 'https://scouts.ie/dublin', 'dublin@scouts.ie', NULL, NULL, '2025-12-04 22:30:06.139138+00', '2025-12-08 02:52:27.595061+00', '2025-12-08 02:52:27.518+00', NULL, NULL, NULL, NULL, NULL, false, false),
	('38edde00-b058-405d-bbfb-ef7840cf23cd', '60eed8cc-dc5c-44bb-bb13-ce2a38b420f9', 'Kerry', 'kerry', 'Kerry County Scouting', NULL, 'https://scouts.ie/kerry', 'kerry@scouts.ie', NULL, NULL, '2025-12-04 22:30:06.139138+00', '2025-12-08 02:53:21.371028+00', '2025-12-08 02:53:21.293+00', NULL, NULL, NULL, NULL, NULL, false, false),
	('adaf87e4-66ad-430f-a3f8-aaf1a088b510', 'f52429a2-8c70-4ef1-afb1-001ef292a0ae', 'Kildare', 'kildare', 'Kildare County Scouting', NULL, 'https://scouts.ie/kildare', 'kildare@scouts.ie', NULL, NULL, '2025-12-04 22:30:06.139138+00', '2025-12-08 02:53:37.988302+00', '2025-12-08 02:53:37.719+00', NULL, NULL, NULL, NULL, NULL, false, false),
	('7485955d-2650-45f4-b5e5-ea773c1d4643', '60eed8cc-dc5c-44bb-bb13-ce2a38b420f9', 'Limerick', 'limerick', 'Limerick County Scouting', NULL, 'https://scouts.ie/limerick', 'limerick@scouts.ie', NULL, NULL, '2025-12-04 22:30:06.139138+00', '2025-12-08 02:55:24.782237+00', '2025-12-08 02:55:24.712+00', NULL, NULL, NULL, NULL, NULL, false, false),
	('282e56a3-8aca-435a-a026-d014b127dd04', 'f52429a2-8c70-4ef1-afb1-001ef292a0ae', 'Meath', 'meath', 'Meath County Scouting', NULL, 'https://scouts.ie/meath', 'meath@scouts.ie', NULL, NULL, '2025-12-04 22:30:06.139138+00', '2025-12-08 02:57:48.409057+00', '2025-12-08 02:57:48.332+00', NULL, NULL, NULL, NULL, NULL, false, false),
	('7578fe07-bc33-4bd4-b94d-a05953d81383', '4d88bb76-682b-4728-88d5-531d78e1d5ad', 'Monaghan', 'monaghan', 'Monaghan County Scouting', NULL, 'https://scouts.ie/monaghan', 'monaghan@scouts.ie', NULL, NULL, '2025-12-04 22:30:06.139138+00', '2025-12-08 02:58:30.662544+00', '2025-12-08 02:58:30.588+00', NULL, NULL, NULL, NULL, NULL, false, false),
	('93d17b27-d419-42f1-aa02-7d49bc0fb823', '5d6db586-8630-4ed0-9342-fc3bf95201f3', 'Roscommon', 'roscommon', 'Roscommon County Scouting', NULL, 'https://scouts.ie/roscommon', 'roscommon@scouts.ie', NULL, NULL, '2025-12-04 22:30:06.139138+00', '2025-12-08 03:01:32.254578+00', '2025-12-08 03:01:32.183+00', NULL, NULL, NULL, NULL, NULL, false, false),
	('9cd224b7-76f6-4876-a58b-9188a3448133', '7f4f6004-2124-47e0-931d-c40f7d71bea4', 'Clare Scout County', 'clare-scout-county', 'Clare Scout County ', 'https://kjezhjbxcfgmueqmdjiy.supabase.co/storage/v1/object/public/organization-logos/county/9cd224b7-76f6-4876-a58b-9188a3448133/1765163090908.png', NULL, 'clarecountypro@gmail.com', 'https://www.facebook.com/ClareScoutCounty', 'https://www.instagram.com/clarescoutcounty', '2025-12-08 03:04:47.727419+00', '2025-12-08 03:04:51.885223+00', NULL, '<p>Clare Scout County </p>', NULL, NULL, NULL, NULL, false, false),
	('4808818a-8a97-451f-827b-3f3a5a81c917', 'f52429a2-8c70-4ef1-afb1-001ef292a0ae', 'Wicklow', 'wicklow', 'Wicklow County Scouting', NULL, 'https://scouts.ie/wicklow', 'wicklow@scouts.ie', NULL, NULL, '2025-12-04 22:30:06.139138+00', '2025-12-08 03:19:56.805534+00', '2025-12-08 03:19:56.534+00', NULL, NULL, NULL, NULL, NULL, false, false),
	('c07d1f0c-c34c-45b6-a2e0-21aaf23d91b1', '7f4f6004-2124-47e0-931d-c40f7d71bea4', 'Lough Keel Scout County', 'lough-keel-scout-county', 'Lough Keel Scout County covers Leitrim, Longford, and Roscommon.', 'https://kjezhjbxcfgmueqmdjiy.supabase.co/storage/v1/object/public/organization-logos/county/c07d1f0c-c34c-45b6-a2e0-21aaf23d91b1/1765164198694.jpeg', NULL, NULL, 'https://www.facebook.com/LoughKeelScouts/', NULL, '2025-12-08 03:23:17.467327+00', '2025-12-08 03:23:19.190277+00', NULL, '<p>Lough Keel Scout County covers Leitrim, Longford, and Roscommon.</p>', NULL, NULL, NULL, NULL, false, false),
	('09c9f169-af0a-4ef4-be06-82719ef4da55', '7f4f6004-2124-47e0-931d-c40f7d71bea4', 'Galway Scout County', 'galway', 'Galway County Scouting', 'https://kjezhjbxcfgmueqmdjiy.supabase.co/storage/v1/object/public/organization-logos/county/09c9f169-af0a-4ef4-be06-82719ef4da55/1764891853490.png', 'https://galwayscoutcounty.ie/', 'info@galwayscoutcounty.ie', NULL, NULL, '2025-12-04 22:30:06.139138+00', '2025-12-08 15:39:40.479861+00', NULL, '<p>Galway Scout County Supports the <strong>County Galway based Scouting Groups</strong> with support from Scouting Ireland.</p>', NULL, NULL, NULL, NULL, false, false);


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."events" ("id", "title", "slug", "featured_image_url", "body", "tags", "start_date", "end_date", "location", "price", "capacity_groups", "capacity_scouters", "capacity_youth", "scope_type", "scope_id", "visibility", "pricing_mode", "price_scouter", "price_youth", "require_participant_info", "require_payment", "author_id", "published", "published_at", "created_at", "updated_at", "deleted_at", "payment_method", "selected_section_types") VALUES
	('46132f83-cf00-4d5e-961c-697be99ffd9c', '1st Dublin Annual Camp', '1st-dublin-annual-camp-46132f83', NULL, '<p>Our annual group camp is back! Join us for a weekend of fun, adventure, and scouting activities.</p><p>All sections welcome. Activities tailored for each age group.</p>', '{camping,annual-camp,1st-dublin}', '2025-12-18 22:30:35.420757+00', '2025-12-20 22:30:35.420757+00', 'Local Campsite', 30.00, NULL, NULL, 60, 'group', '72398f1f-6709-4135-a582-e94e6c6cc9ef', 'open_to_all', 'per_scout', NULL, NULL, false, false, '00000000-0000-0000-0000-000000000001', true, '2025-12-01 22:30:35.420757+00', '2025-12-04 22:30:35.420757+00', '2025-12-08 02:58:48.863937+00', '2025-12-08 02:58:48.493+00', NULL, '{}'),
	('d103bbff-b9cd-41b7-a79e-106636f5e1d1', 'Leinster Jamboree 2025', 'leinster-jamboree-2025-d103bbff', NULL, '<p>Join us for the biggest scouting event in Leinster this year!</p><p><strong>Activities include:</strong></p><ul><li>Hiking and orienteering</li><li>Camping and outdoor cooking</li><li>Team challenges and games</li><li>Campfire entertainment</li></ul><p>Open to all scouts aged 12-17 from across Leinster Province.</p>', '{jamboree,camping,adventure}', '2026-03-04 22:30:35.420757+00', '2026-03-07 22:30:35.420757+00', 'Wicklow Mountains National Park', 50.00, NULL, NULL, 200, 'province', 'f52429a2-8c70-4ef1-afb1-001ef292a0ae', 'open_to_all', 'per_scout', NULL, NULL, false, false, '00000000-0000-0000-0000-000000000001', true, '2025-11-24 22:30:35.420757+00', '2025-12-04 22:30:35.420757+00', '2025-12-08 00:28:43.808927+00', '2025-12-08 00:28:40.038+00', NULL, '{}'),
	('cd2fa72b-2423-4894-bd7b-9b131ce340b2', 'Venture Ball 2026', 'venture-ball-2026-cd2fa72b', NULL, NULL, '{}', '2026-01-10 12:00:00+00', NULL, NULL, NULL, NULL, NULL, NULL, 'province', '7f4f6004-2124-47e0-931d-c40f7d71bea4', 'open_to_all', NULL, NULL, NULL, false, false, '5ba4f970-d952-4b4e-9470-c021e3efd767', false, '2025-12-06 13:44:23.15+00', '2025-12-06 13:44:23.266589+00', '2025-12-08 01:16:03.07029+00', NULL, NULL, '{}'),
	('d5177457-ce0e-4db5-9412-212c6492f722', 'Survivor 2026', 'survivor-2026-d5177457', NULL, NULL, '{}', '2026-01-09 12:00:00+00', NULL, NULL, NULL, NULL, NULL, NULL, 'province', '7f4f6004-2124-47e0-931d-c40f7d71bea4', 'open_to_all', NULL, NULL, NULL, false, false, '5ba4f970-d952-4b4e-9470-c021e3efd767', false, '2025-12-05 01:02:26.228+00', '2025-12-05 01:02:26.342388+00', '2025-12-08 01:16:03.362992+00', NULL, NULL, '{}'),
	('ad0317db-0019-4fac-bc5e-f745919c75cf', 'test', 'test-ad0317db', NULL, NULL, '{}', '2025-12-19 12:00:00+00', NULL, NULL, NULL, NULL, NULL, NULL, 'province', '7f4f6004-2124-47e0-931d-c40f7d71bea4', 'open_to_all', NULL, NULL, NULL, false, false, '5ba4f970-d952-4b4e-9470-c021e3efd767', false, '2025-12-08 01:26:26.125443+00', '2025-12-05 22:03:25.401076+00', '2025-12-08 01:26:34.939636+00', NULL, NULL, '{}'),
	('d6d06c6b-b6c2-42fc-afbf-40c466aef82b', 'Laoch Coille - Cubs Survivor', 'laoch-coille---cubs-survivor-d6d06c6b', 'https://kjezhjbxcfgmueqmdjiy.supabase.co/storage/v1/object/public/news-images/province/7f4f6004-2124-47e0-931d-c40f7d71bea4/1765157486536.jpg', '<p>Can you SURVIVE LAOCH COILLE? Come and be a part of this exciting challenge where Cubs will learn the skills to light fires, make shelters, cook in the outdoors all while having loads of fun and games in the woods.</p><p>Date: 15th/16th May 2025.</p><p>Location: Lough Keel Scout Centre.</p><p>Keep an eye out for more infomation here or contact <a target="_blank" rel="noopener noreferrer nofollow" class="text-primary underline" href="mailto:westernprovincecubs@gmail.com">westernprovincecubs@gmail.com</a> or <a target="_blank" rel="noopener noreferrer nofollow" class="text-primary underline" href="mailto:pyprwest@gmail.com">pyprwest@gmail.com</a></p>', '{Survivor}', '2026-05-15 09:00:00+00', '2026-05-16 09:00:00+00', 'Lough Keel Scout Centre', NULL, NULL, NULL, NULL, 'province', '7f4f6004-2124-47e0-931d-c40f7d71bea4', 'sections_only', NULL, NULL, NULL, false, false, '6d63d9e6-316c-4b29-bf6b-7ff03b623328', true, '2025-12-08 01:31:53.947+00', '2025-12-08 01:31:55.321634+00', '2025-12-08 01:31:55.321634+00', NULL, NULL, '{cubs}'),
	('aa0b6265-c6f3-48e2-8350-99dc02fea62a', 'Dublin County Skills Day', 'dublin-county-skills-day-aa0b6265', NULL, '<p>A day of skill-building workshops for scouts of all ages.</p><p>Workshops include first aid, knot tying, map reading, and outdoor cooking. Perfect for scouts working towards their badges!</p>', '{skills,training,workshop}', '2026-01-04 22:30:35.420757+00', '2026-01-04 22:30:35.420757+00', 'Dublin Scout Centre', 15.00, NULL, NULL, 100, 'county', '27696f76-b5fa-4437-9427-5d25fa03b616', 'open_to_all', 'per_scout', NULL, NULL, false, false, '00000000-0000-0000-0000-000000000001', true, '2025-11-29 22:30:35.420757+00', '2025-12-04 22:30:35.420757+00', '2025-12-08 02:52:28.188923+00', '2025-12-08 02:52:27.518+00', NULL, '{}'),
	('129160a5-d51e-45d4-a0e0-cee30b7115cf', 'Scouters Only: Leadership Retreat', 'scouters-only-leadership-retreat-129160a5', NULL, '<p>An exclusive weekend retreat for adult volunteers to network, share best practices, and develop leadership skills.</p><p>Includes accommodation, meals, and professional development sessions.</p>', '{leadership,training,scouters}', '2026-02-04 22:30:35.420757+00', '2026-02-06 22:30:35.420757+00', 'Wicklow Mountains', 75.00, NULL, NULL, 50, 'county', '27696f76-b5fa-4437-9427-5d25fa03b616', 'scouters_only', 'per_person_type', 75.00, NULL, false, false, '00000000-0000-0000-0000-000000000001', true, '2025-11-27 22:30:35.420757+00', '2025-12-04 22:30:35.420757+00', '2025-12-08 02:52:28.188923+00', '2025-12-08 02:52:27.518+00', NULL, '{}'),
	('5cae403d-11f4-4cf6-b77a-bf0b0bcdf6f2', 'Clonbur Night Hike 2025', 'clonbur-night-hike-5cae403d', 'https://kjezhjbxcfgmueqmdjiy.supabase.co/storage/v1/object/public/news-images/group/ffa9761a-b44b-4c8f-9026-856fa1b7df88/5cae403d-11f4-4cf6-b77a-bf0b0bcdf6f2/1765214690192.jpg', '<p><strong>Start and End Location:</strong></p><p>Meeting Location: 7pm Clonbur Car Park <a target="_blank" rel="noopener noreferrer nofollow" class="text-primary underline" href="https://maps.app.goo.gl/JRDwTyojRWMCDTCJ8">https://maps.app.goo.gl/JRDwTyojRWMCDTCJ8</a></p><p>Collection location: 10pm Cong main Carpark <a target="_blank" rel="noopener noreferrer nofollow" class="text-primary underline" href="https://maps.app.goo.gl/r6znZ1LPM9P5uY189">https://maps.app.goo.gl/r6znZ1LPM9P5uY189</a></p><p></p><p>Please wear clothing for walking in the woods</p><p><strong>What to bring:</strong></p><ul><li><p>Small rucksack</p></li><li><p>HighVis</p></li><li><p>Head torch</p></li><li><p>Small drink</p></li><li><p>Cup</p></li><li><p>Phones, if they have one</p></li></ul><p>Secret Santa: Anyone who would like to take part in the secret Santa, please can you bring a wrapped present costing no more than €7 and a separate sticky label with the scouts full name on it. We will distribute them at the end of the walk.</p><p></p>', '{"night hike",clonbur}', '2025-12-19 12:00:00+00', '2025-12-19 15:00:00+00', 'Clonbur', NULL, NULL, NULL, NULL, 'group', 'ffa9761a-b44b-4c8f-9026-856fa1b7df88', 'open_to_all', NULL, NULL, NULL, false, false, '6d63d9e6-316c-4b29-bf6b-7ff03b623328', true, '2025-12-08 17:23:30.825+00', '2025-12-08 17:23:30.912203+00', '2025-12-08 17:24:51.314208+00', NULL, NULL, '{}'),
	('74f76c44-bcf8-434d-a565-691ffcadbce4', 'National Assembly 2026', 'national-assembly-2026-74f76c44', 'https://kjezhjbxcfgmueqmdjiy.supabase.co/storage/v1/object/public/news-images/sitewide/00000000-0000-0000-0000-000000000000/74f76c44-bcf8-434d-a565-691ffcadbce4/1765291845195.png', '<p>At the AGM of Scouting Ireland in September we unanimously approved the hosting of a National Assembly on 21st March 2026.</p><p></p><p><strong>What is the National Assembly?</strong></p><p>The National Assembly of Scouting Ireland is a gathering of the Scouting Community within Scouting Ireland that will focus on the development of the movement of Scouting Ireland. It aims to provide a forum for Scouters, through their Scout Groups, to make proposals for consideration by Scouting Ireland’s leadership team (Board, volunteer leadership, and staff).</p><p></p><p><strong>Who can attend?</strong></p><p>Youth Members and Adult Scouters, including Group Representatives, County Representatives, Provincial Representatives, National Representatives.</p><p></p><p><strong>Who can submit a Proposal?</strong></p><p>Scout Groups</p><p></p><p><strong>When is the National Assembly of Scouting Ireland?</strong></p><p>Saturday 21st March 2026</p><p></p><p><strong>Where will the National Assembly be held?</strong></p><p>The Helix, Dublin 9</p>', '{"National Event"}', '2026-03-21 05:00:00+00', NULL, 'The Helix, Dublin 9', NULL, NULL, NULL, NULL, 'sitewide', '00000000-0000-0000-0000-000000000000', 'open_to_all', NULL, NULL, NULL, false, false, '6d63d9e6-316c-4b29-bf6b-7ff03b623328', true, '2025-12-09 14:44:23.29+00', '2025-12-09 14:44:23.48205+00', '2025-12-09 14:50:49.906782+00', NULL, NULL, '{}');


--
-- Data for Name: event_forms; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."event_forms" ("id", "event_id", "form_type", "title", "enabled", "display_order", "created_at", "updated_at", "button_text", "description") VALUES
	('5bf54dd4-12e9-4b11-9966-39704284171d', 'd5177457-ce0e-4db5-9412-212c6492f722', 'registration', 'Registration', true, 0, '2025-12-05 02:09:49.879218+00', '2025-12-05 17:47:44.605204+00', 'Register Now', NULL),
	('c50a59d2-3065-4e72-9c7f-686e28457ca9', 'ad0317db-0019-4fac-bc5e-f745919c75cf', 'registration', 'test', true, 0, '2025-12-06 01:50:32.0309+00', '2025-12-06 01:50:32.0309+00', 'Register Now', NULL),
	('5608b51c-d452-4493-beab-fb330297c4e1', 'd6d06c6b-b6c2-42fc-afbf-40c466aef82b', 'registration', 'Test', true, 0, '2025-12-08 10:25:15.234378+00', '2025-12-08 10:25:15.234378+00', 'Register Now', NULL);


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."groups" ("id", "county_id", "name", "slug", "description", "logo_url", "website", "email", "facebook_url", "instagram_url", "created_at", "updated_at", "deleted_at", "long_description", "iban", "bic", "account_name", "stripe_account_id", "stripe_charges_enabled", "stripe_details_submitted") VALUES
	('a2c8fde1-6d8d-4c77-86b5-0e54dc24c192', '27696f76-b5fa-4437-9427-5d25fa03b616', '2nd Dublin Scout Group', '2nd-dublin-scout-group', 'Serving the Dublin community since 1920', NULL, 'https://scouts.ie/2nd-dublin', '2nddublin@scouts.ie', NULL, NULL, '2025-12-04 22:30:10.400508+00', '2025-12-04 22:30:10.400508+00', NULL, NULL, NULL, NULL, NULL, NULL, false, false),
	('165b159a-a5f2-406d-aec0-bd3fc2f73250', '4808818a-8a97-451f-827b-3f3a5a81c917', '2nd Wicklow Scout Group', '2nd-wicklow-scout-group', 'Adventure and outdoor activities in County Wicklow', NULL, 'https://scouts.ie/2nd-wicklow', '2ndwicklow@scouts.ie', NULL, NULL, '2025-12-04 22:30:10.400508+00', '2025-12-04 22:30:10.400508+00', NULL, NULL, NULL, NULL, NULL, NULL, false, false),
	('bae84943-341b-498c-a6cf-30a004ac28af', 'a9ca7b0f-712a-42f3-9f64-406b985067ee', '1st Cork Scout Group', '1st-cork-scout-group', 'Cork''s premier scouting group', NULL, 'https://scouts.ie/1st-cork', '1stcork@scouts.ie', NULL, NULL, '2025-12-04 22:30:10.400508+00', '2025-12-08 02:53:08.929418+00', '2025-12-08 02:53:08.863+00', NULL, NULL, NULL, NULL, NULL, false, false),
	('72398f1f-6709-4135-a582-e94e6c6cc9ef', '27696f76-b5fa-4437-9427-5d25fa03b616', '1st Dublin Scout Group', '1st-dublin-scout-group', 'A vibrant scouting group in the heart of Dublin', NULL, 'https://scouts.ie/1st-dublin', '1stdublin@scouts.ie', NULL, NULL, '2025-12-04 22:30:10.400508+00', '2025-12-08 02:58:48.578215+00', '2025-12-08 02:58:48.493+00', NULL, NULL, NULL, NULL, NULL, false, false),
	('d9fa3388-cbcf-4dfa-ba0f-aa77d10ee6ab', '09c9f169-af0a-4ef4-be06-82719ef4da55', '1st Galway Scout Group', '1st-galway-scout-group', 'Scouting on the Wild Atlantic Way', NULL, 'https://scouts.ie/1st-galway', '1stgalway@scouts.ie', NULL, NULL, '2025-12-04 22:30:10.400508+00', '2025-12-08 02:59:22.106752+00', '2025-12-08 02:59:22.033+00', NULL, NULL, NULL, NULL, NULL, false, false),
	('64532802-f498-4add-a396-fd1d0cc6281c', '27696f76-b5fa-4437-9427-5d25fa03b616', '3rd Dublin Scout Group', '3rd-dublin-scout-group', 'Building character and leadership in young people', NULL, 'https://scouts.ie/3rd-dublin', '3rddublin@scouts.ie', NULL, NULL, '2025-12-04 22:30:10.400508+00', '2025-12-08 02:59:41.778099+00', '2025-12-08 02:59:41.696+00', NULL, NULL, NULL, NULL, NULL, false, false),
	('7efb7365-4f07-4e71-b3f2-952c97f485e4', '38edde00-b058-405d-bbfb-ef7840cf23cd', '1st Kerry Scout Group', '1st-kerry-scout-group', 'Adventure in the Kingdom of Kerry', NULL, 'https://scouts.ie/1st-kerry', '1stkerry@scouts.ie', NULL, NULL, '2025-12-04 22:30:10.400508+00', '2025-12-08 03:00:00.949935+00', '2025-12-08 03:00:00.876+00', NULL, NULL, NULL, NULL, NULL, false, false),
	('8c8ce036-8ce9-48b8-ab3e-1aff76670833', '4808818a-8a97-451f-827b-3f3a5a81c917', '1st Wicklow Scout Group', '1st-wicklow-scout-group', 'Exploring the beautiful Wicklow mountains', NULL, 'https://scouts.ie/1st-wicklow', '1stwicklow@scouts.ie', NULL, NULL, '2025-12-04 22:30:10.400508+00', '2025-12-08 03:00:16.423018+00', '2025-12-08 03:00:16.356+00', NULL, NULL, NULL, NULL, NULL, false, false),
	('0c7d200d-a04b-4578-84be-3fd012f12052', 'a9ca7b0f-712a-42f3-9f64-406b985067ee', '2nd Cork Scout Group', '2nd-cork-scout-group', 'Building future leaders in Cork', NULL, 'https://scouts.ie/2nd-cork', '2ndcork@scouts.ie', NULL, NULL, '2025-12-04 22:30:10.400508+00', '2025-12-08 03:01:00.750279+00', '2025-12-08 03:01:00.681+00', NULL, NULL, NULL, NULL, NULL, false, false),
	('ffa9761a-b44b-4c8f-9026-856fa1b7df88', '09c9f169-af0a-4ef4-be06-82719ef4da55', '26th Galway Kilcoona', '26th-galway-kilcoona', 'Kilcoona Scout group in Galway', 'https://kjezhjbxcfgmueqmdjiy.supabase.co/storage/v1/object/public/organization-logos/group/ffa9761a-b44b-4c8f-9026-856fa1b7df88/1765208334135.png', 'https://26thgalway.ie/', '26thgalwayscoutgroup@gmail.com', 'https://www.facebook.com/kilcoonascouts', NULL, '2025-12-04 23:50:44.75819+00', '2025-12-08 20:16:38.656283+00', NULL, '<p>We are a rural Scouting group that <strong>provide a fun, educational, community based scouting programme</strong> for the young people in our local area . We service a large community area including Claran, Headford, Annaghdown, Corrandulla, Caherlistrane, and Kilcoona .&nbsp;</p>', NULL, NULL, NULL, NULL, false, false);


--
-- Data for Name: sections; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."sections" ("id", "group_id", "name", "section_type", "description", "created_at", "updated_at") VALUES
	('fd0f93e4-86f8-49d1-ac11-028efeee655f', '72398f1f-6709-4135-a582-e94e6c6cc9ef', 'Beaver Colony', 'beavers', 'Ages 6-8 - Fun and adventure for our youngest members', '2025-12-04 22:30:15.29017+00', '2025-12-04 22:30:15.29017+00'),
	('85eaf7d0-6458-42b1-ad9f-7df796da3b2e', '72398f1f-6709-4135-a582-e94e6c6cc9ef', 'Cub Pack', 'cubs', 'Ages 9-11 - Learning through games and activities', '2025-12-04 22:30:15.29017+00', '2025-12-04 22:30:15.29017+00'),
	('a5fb5603-e455-4dfd-bae4-53115f622bf5', '72398f1f-6709-4135-a582-e94e6c6cc9ef', 'Scout Troop', 'scouts', 'Ages 12-15 - Adventure, camping, and skill building', '2025-12-04 22:30:15.29017+00', '2025-12-04 22:30:15.29017+00'),
	('b3185184-a415-4910-ae4b-cab00a9aeaa1', '72398f1f-6709-4135-a582-e94e6c6cc9ef', 'Venture Unit', 'ventures', 'Ages 15-17 - Leadership and personal development', '2025-12-04 22:30:15.29017+00', '2025-12-04 22:30:15.29017+00'),
	('b08eb53f-f28b-4733-9dcd-9077b2035f89', 'a2c8fde1-6d8d-4c77-86b5-0e54dc24c192', 'Beaver Colony', 'beavers', 'Ages 6-8', '2025-12-04 22:30:15.29017+00', '2025-12-04 22:30:15.29017+00'),
	('32d4d957-1c34-44e9-8291-0c412d96622c', 'a2c8fde1-6d8d-4c77-86b5-0e54dc24c192', 'Cub Pack', 'cubs', 'Ages 9-11', '2025-12-04 22:30:15.29017+00', '2025-12-04 22:30:15.29017+00'),
	('e98f0cd5-e5ab-4e27-9511-405a69baf5e2', 'a2c8fde1-6d8d-4c77-86b5-0e54dc24c192', 'Scout Troop', 'scouts', 'Ages 12-15', '2025-12-04 22:30:15.29017+00', '2025-12-04 22:30:15.29017+00'),
	('841aee85-6805-4d8f-ab4c-5e1347c770f8', '8c8ce036-8ce9-48b8-ab3e-1aff76670833', 'Beaver Colony', 'beavers', 'Ages 6-8', '2025-12-04 22:30:15.29017+00', '2025-12-04 22:30:15.29017+00'),
	('b7888e04-c005-4d0b-85f0-db96a0d86996', '8c8ce036-8ce9-48b8-ab3e-1aff76670833', 'Cub Pack', 'cubs', 'Ages 9-11', '2025-12-04 22:30:15.29017+00', '2025-12-04 22:30:15.29017+00'),
	('e403fb02-0a78-48e7-b6dd-1486e2d19844', '8c8ce036-8ce9-48b8-ab3e-1aff76670833', 'Scout Troop', 'scouts', 'Ages 12-15', '2025-12-04 22:30:15.29017+00', '2025-12-04 22:30:15.29017+00'),
	('dcb27593-ae59-47d6-a3b9-fc8a7393b51c', '8c8ce036-8ce9-48b8-ab3e-1aff76670833', 'Rover Crew', 'rovers', 'Ages 18-26 - Service and adventure', '2025-12-04 22:30:15.29017+00', '2025-12-04 22:30:15.29017+00'),
	('7ea176f7-cdbe-45fe-9355-dbcaccf752f1', 'ffa9761a-b44b-4c8f-9026-856fa1b7df88', '26th Galway Kilcoona Beavers', 'beavers', NULL, '2025-12-08 19:42:32.642794+00', '2025-12-08 19:42:32.642794+00'),
	('36a9fde4-e6a5-40d8-9da3-bf43b84b285e', 'ffa9761a-b44b-4c8f-9026-856fa1b7df88', '26th Galway Kilcoona Cubs', 'cubs', NULL, '2025-12-08 19:42:33.77884+00', '2025-12-08 19:42:33.77884+00'),
	('4baeb589-d46e-4ab1-be55-c372cdc1a3ab', 'ffa9761a-b44b-4c8f-9026-856fa1b7df88', '26th Galway Kilcoona Scouts', 'scouts', NULL, '2025-12-08 19:42:34.393445+00', '2025-12-08 19:42:34.393445+00'),
	('ce3be66a-4f36-4e57-87b9-e9b7eeaa6921', 'ffa9761a-b44b-4c8f-9026-856fa1b7df88', '26th Galway Kilcoona Ventures', 'ventures', NULL, '2025-12-08 19:42:35.135006+00', '2025-12-08 19:42:35.135006+00');


--
-- Data for Name: event_sections; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: form_fields; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."form_fields" ("id", "form_id", "field_type", "label", "required", "display_order", "options", "participants_config", "created_at", "updated_at") VALUES
	('79f5f90f-a1e0-4857-abeb-ec5f83e47bda', '5bf54dd4-12e9-4b11-9966-39704284171d', 'multi_select', 'Levels Participating In', true, 4, '["Delta", "Beta", "Alpha"]', NULL, '2025-12-05 17:03:51.608481+00', '2025-12-05 17:09:39.566803+00'),
	('db4903bf-3a94-4c9c-886f-f1149f35ade4', '5bf54dd4-12e9-4b11-9966-39704284171d', 'group', 'Group', true, 3, NULL, NULL, '2025-12-05 17:02:41.4058+00', '2025-12-05 17:09:43.148858+00'),
	('d4d30049-38cd-4ffa-a8b8-807bd685b267', '5bf54dd4-12e9-4b11-9966-39704284171d', 'participants', 'Participants', true, 5, NULL, '{"youth_fields": {"email": false, "phone": false, "last_name": true, "first_name": true, "date_of_birth": true}, "scouter_fields": {"email": true, "phone": true, "last_name": true, "first_name": true, "date_of_birth": true}, "participant_types": ["youth_member", "scouter"], "selected_sections": []}', '2025-12-05 17:09:35.789631+00', '2025-12-05 17:35:10.003127+00'),
	('0edefcbb-eb44-4fc6-91e0-8ea3c636fc98', 'c50a59d2-3065-4e72-9c7f-686e28457ca9', 'short_text', 'test', false, 1, NULL, NULL, '2025-12-06 01:50:43.502798+00', '2025-12-06 01:51:14.340197+00'),
	('457853f3-69a2-4bf4-a931-97b63cad07a4', 'c50a59d2-3065-4e72-9c7f-686e28457ca9', 'participants', 'particiapnt', false, 2, NULL, '{"youth_fields": {"email": false, "phone": false, "last_name": true, "first_name": true, "date_of_birth": true}, "scouter_fields": {"email": true, "phone": true, "last_name": true, "first_name": true, "date_of_birth": true}, "participant_types": ["youth_member", "scouter"], "selected_sections": []}', '2025-12-06 01:51:11.659151+00', '2025-12-06 01:51:14.414079+00'),
	('f63efa65-e13b-43c5-96f2-a3b3082ba429', 'c50a59d2-3065-4e72-9c7f-686e28457ca9', 'group', 'Group', false, 0, NULL, NULL, '2025-12-06 01:50:51.195963+00', '2025-12-06 01:51:14.457707+00'),
	('49188f3d-6e92-41ba-b101-8cadc2f71ed6', '5608b51c-d452-4493-beab-fb330297c4e1', 'long_text', 'Long Text', true, 0, NULL, NULL, '2025-12-08 10:25:28.634758+00', '2025-12-08 10:25:28.634758+00'),
	('4a9fb034-2508-4d1f-b895-4602d2d678f3', '5608b51c-d452-4493-beab-fb330297c4e1', 'multi_select', 'Multi Select', false, 1, '["Yes", "No"]', NULL, '2025-12-08 10:25:38.11629+00', '2025-12-08 10:25:38.11629+00'),
	('23db3e36-6123-438a-9f8a-108dff3c4a16', '5608b51c-d452-4493-beab-fb330297c4e1', 'participants', 'Participants', false, 2, NULL, '{"youth_fields": {"email": false, "phone": false, "last_name": true, "first_name": true, "date_of_birth": true}, "scouter_fields": {"email": true, "phone": true, "last_name": true, "first_name": true, "date_of_birth": true}, "participant_types": ["youth_member", "scouter"], "selected_sections": []}', '2025-12-08 10:26:03.898523+00', '2025-12-08 10:26:03.898523+00');


--
-- Data for Name: form_submission_data; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: form_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."form_submissions" ("id", "form_id", "user_id", "submission_data", "created_at", "updated_at", "payment_status", "payment_amount", "stripe_session_id", "stripe_payment_intent_id") VALUES
	('a581c307-fc47-4c80-abef-97d907f07261', '5bf54dd4-12e9-4b11-9966-39704284171d', '5ba4f970-d952-4b4e-9470-c021e3efd767', '{"79f5f90f-a1e0-4857-abeb-ec5f83e47bda": ["Delta", "Beta"], "d4d30049-38cd-4ffa-a8b8-807bd685b267": [{"type": "youth_member", "last_name": "Doe", "first_name": "John", "date_of_birth": "2025-12-13"}, {"type": "scouter", "email": "ruairi@propellerdigital.ie", "phone": "0867304673", "last_name": "McNicholas", "first_name": "Ruairi", "date_of_birth": "2025-12-05"}]}', '2025-12-05 17:58:30.71113+00', '2025-12-05 17:58:30.71113+00', NULL, NULL, NULL, NULL),
	('f25b9026-be55-4259-8808-64d6793634bf', '5608b51c-d452-4493-beab-fb330297c4e1', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', '{"23db3e36-6123-438a-9f8a-108dff3c4a16": [{"type": "youth_member", "last_name": "Test", "first_name": "Test", "date_of_birth": "2025-12-10"}, {"type": "scouter", "email": "ruairi@propellerdigital.ie", "phone": "0867304673", "last_name": "Doe", "first_name": "John", "date_of_birth": "2025-12-02"}], "49188f3d-6e92-41ba-b101-8cadc2f71ed6": "Test", "4a9fb034-2508-4d1f-b895-4602d2d678f3": ["Yes"]}', '2025-12-08 10:26:32.98878+00', '2025-12-08 10:26:32.98878+00', NULL, NULL, NULL, NULL);


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "email", "avatar_url", "created_at", "updated_at", "first_name", "last_name") VALUES
	('00000000-0000-0000-0000-000000000001', 'system@scout-hub.local', NULL, '2025-12-04 22:30:22.953499+00', '2025-12-08 18:09:26.593073+00', 'System', 'User'),
	('6d63d9e6-316c-4b29-bf6b-7ff03b623328', 'ruairimcn@protonmail.com', NULL, '2025-12-04 23:00:11.981841+00', '2025-12-08 18:09:26.593073+00', 'ruairimcn@protonmail.com', ''),
	('5ba4f970-d952-4b4e-9470-c021e3efd767', 'test@test.com', NULL, '2025-12-04 23:56:18.496591+00', '2025-12-08 18:09:26.593073+00', 'Province', 'Test Admin'),
	('0b690928-fdac-4ea4-847f-5190521ddfe0', 'kilcoonaventures@gmail.com', NULL, '2025-12-08 15:56:53.149007+00', '2025-12-08 18:09:26.593073+00', 'Sean', 'McCormack'),
	('b8b05d96-4496-4724-b527-199b7db8d848', 'ruairi.mcnicholas@finsweet.com', NULL, '2025-12-08 18:58:18.396414+00', '2025-12-08 18:58:18.396414+00', 'Ruairi', 'McNicholas'),
	('30d04492-d7dc-4fe8-8686-96b21d006170', 'kilcoonacubs@gmail.com', NULL, '2025-12-08 19:13:35.836887+00', '2025-12-08 19:13:35.836887+00', 'Ruairi', 'McNicholas');


--
-- Data for Name: knowledgebase_articles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."knowledgebase_articles" ("id", "title", "slug", "body", "tags", "scope_type", "scope_id", "author_id", "published", "published_at", "created_at", "updated_at", "description", "section_types", "adventure_skill", "featured_image_url") VALUES
	('cf50ab54-d935-47d6-8d06-245ea23e2950', 'Leinster Province Policies and Procedures', 'leinster-province-policies-and-procedures-cf50ab54', '<h2>Overview</h2><p>This document outlines the key policies and procedures for all groups operating within Leinster Province.</p><h2>Safety Guidelines</h2><p>All activities must comply with Scouting Ireland safety guidelines. Risk assessments must be completed for all outdoor activities.</p><h2>Reporting Requirements</h2><p>Groups are required to submit quarterly activity reports to the provincial office.</p>', '{policies,procedures,safety}', 'province', 'f52429a2-8c70-4ef1-afb1-001ef292a0ae', '00000000-0000-0000-0000-000000000001', true, '2025-11-04 22:30:44.050722+00', '2025-12-04 22:30:44.050722+00', '2025-12-04 22:30:44.050722+00', NULL, '{}', NULL, NULL),
	('3e196a02-9d9b-4047-9b47-a872da0fe831', 'Event Planning Checklist', 'event-planning-checklist-3e196a02', '<h2>Pre-Event Planning</h2><ul><li>Secure venue and permissions</li><li>Complete risk assessment</li><li>Arrange first aid cover</li><li>Plan activities and schedule</li></ul><h2>During Event</h2><ul><li>Maintain attendance register</li><li>Monitor weather conditions</li><li>Ensure adequate supervision</li></ul><h2>Post-Event</h2><ul><li>Complete incident reports if needed</li><li>Gather feedback from participants</li><li>Submit activity report</li></ul>', '{events,planning,checklist}', 'province', 'f52429a2-8c70-4ef1-afb1-001ef292a0ae', '00000000-0000-0000-0000-000000000001', true, '2025-11-14 22:30:44.050722+00', '2025-12-04 22:30:44.050722+00', '2025-12-04 22:30:44.050722+00', NULL, '{}', NULL, NULL),
	('a98ef2f5-c785-4146-aa5e-d068bdb5a78b', 'Dublin County Campsite Directory', 'dublin-county-campsite-directory-a98ef2f5', '<h2>Approved Campsites</h2><p>This directory lists all approved campsites within Dublin County and surrounding areas.</p><h2>Booking Procedures</h2><p>All campsite bookings must be made through the county office at least 4 weeks in advance.</p><h2>Facilities</h2><p>Each campsite listing includes details of available facilities, access information, and contact details.</p>', '{campsites,resources,dublin}', 'county', '27696f76-b5fa-4437-9427-5d25fa03b616', '00000000-0000-0000-0000-000000000001', true, '2025-11-19 22:30:44.050722+00', '2025-12-04 22:30:44.050722+00', '2025-12-04 22:30:44.050722+00', NULL, '{}', NULL, NULL),
	('21d78f8a-f134-44a1-8a2f-9d8a1b3e7820', '1st Dublin Group Handbook', '1st-dublin-group-handbook-21d78f8a', '<h2>Welcome to 1st Dublin Scout Group</h2><p>This handbook contains essential information for all members and parents.</p><h2>Meeting Times</h2><ul><li>Beavers: Tuesdays 6:00-7:00 PM</li><li>Cubs: Wednesdays 6:30-8:00 PM</li><li>Scouts: Fridays 7:00-9:00 PM</li><li>Ventures: Sundays 2:00-4:00 PM</li></ul><h2>Contact Information</h2><p>For general enquiries, please contact the Group Leader at 1stdublin@scouts.ie</p>', '{handbook,information,1st-dublin}', 'group', '72398f1f-6709-4135-a582-e94e6c6cc9ef', '00000000-0000-0000-0000-000000000001', true, '2025-11-24 22:30:44.050722+00', '2025-12-04 22:30:44.050722+00', '2025-12-04 22:30:44.050722+00', NULL, '{}', NULL, NULL),
	('c80161ba-5a4f-4cea-afef-1ad28b5fe241', 'test', 'test-c80161ba', '<p>test</p>', '{}', 'province', '7f4f6004-2124-47e0-931d-c40f7d71bea4', '5ba4f970-d952-4b4e-9470-c021e3efd767', false, NULL, '2025-12-05 22:06:00.649397+00', '2025-12-05 22:06:00.649397+00', 'test', '{}', NULL, NULL),
	('25b2cf81-f673-4937-af5a-f55eb914e23c', 'Child Safeguarding Statement 2025', 'child-safeguarding-statement-2025-25b2cf81', '', '{Safeguarding}', 'group', 'ffa9761a-b44b-4c8f-9026-856fa1b7df88', '30d04492-d7dc-4fe8-8686-96b21d006170', true, '2025-12-09 12:36:06.907566+00', '2025-12-09 12:35:53.243243+00', '2025-12-09 12:36:06.907566+00', 'This is the current Child Safeguarding Statement template, released September 2025. This document is a legal requirement in the Republic of Ireland.', '{}', NULL, NULL),
	('b107ebd8-a56f-439e-9834-1f8e92f1a97d', 'Safeguarding - Ratios Policy - 09.25', 'safeguarding---ratios-policy---0925-b107ebd8', '<p></p>', '{"Official Scouting Ireland Documents",Safeguarding,Ratios}', 'group', 'ffa9761a-b44b-4c8f-9026-856fa1b7df88', '30d04492-d7dc-4fe8-8686-96b21d006170', true, NULL, '2025-12-09 11:46:55.669756+00', '2025-12-09 12:36:13.324113+00', 'This policy defines the minimum ratio requirements deemed necessary by Scouting Ireland to ensure the safety, supervision, and well-being of youth members during Scouting activities.', '{}', NULL, NULL),
	('ef74258f-b3ad-452e-a86b-63ac52a812b6', 'Cub Scouts First Six Weeks', 'cub-scouts-first-six-weeks-ef74258f', '<p>This Scouting Ireland resource provides a six-week starter framework to help Cub Scout Packs begin the year smoothly, focusing on SPICES, leadership roles, ceremonies, and team-building games. It is organised around six core activities, each supported by the Atlantic Six characters and linked to SPICES development (Social, Physical, Intellectual, Character, Emotional, Spiritual).</p><p></p><h3><strong>The Six Core Activities Included:</strong></h3><ol><li><p><strong>Saying Goodbye to Cubs Moving Up</strong></p><ul><li><p>How to plan and run a moving-on ceremony</p></li><li><p>Sharing memories, presenting link badges, welcoming Scouts section</p></li></ul><p></p></li><li><p><strong>Welcoming New Cubs (“Saying Hello”)</strong></p><ul><li><p>Tips for inclusion and settling in</p></li><li><p>Icebreaker games: Two Truths and a Lie, Coat of Arms, No-See-Ems</p></li></ul><p></p></li><li><p><strong>Understanding Roles Within a Six</strong></p><ul><li><p>Explains the purpose of Sixes</p></li><li><p>Roles: Sixer, Seconder, Scribe, First Aider, Quartermaster, Researcher, PRO</p></li><li><p>Team-building games (human pyramid, blindfold tent pitching, etc.)</p></li></ul><p></p></li><li><p><strong>Creating a Cub Scout Code of Conduct</strong></p><ul><li><p>Sixes propose rules based on the Promise &amp; Law</p></li><li><p>Pack compiles and signs a shared code of honour</p></li></ul><p></p></li><li><p><strong>Introducing the SPICES Through Games</strong></p><ul><li><p>Sixers represent SPICES</p></li><li><p>Cubs play games and decide which SPICE each relates to</p></li></ul><p></p></li><li><p><strong>SPICES-Themed Games List</strong></p><ul><li><p><strong>Social:</strong> Two-Cub Reef Knot</p></li><li><p><strong>Physical:</strong> North–South–East–West</p></li><li><p><strong>Intellectual:</strong> Wink-Wink Murder</p></li><li><p><strong>Character:</strong> Arm Sling Relay</p></li><li><p><strong>Emotional:</strong> We Like…We Don’t Like</p></li><li><p><strong>Spiritual:</strong> Cat and Mouse</p></li></ul><p></p></li></ol><p></p>', '{"Cub Scout Resources","Starting off"}', 'sitewide', '00000000-0000-0000-0000-000000000000', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', true, '2025-12-09 13:03:04.422+00', '2025-12-09 13:03:04.732186+00', '2025-12-09 13:03:04.732186+00', 'This Scouting Ireland resource provides a six-week starter framework to help Cub Scout Packs begin the year smoothly, focusing on SPICES, leadership roles, ceremonies, and team-building games.', '{Cubs}', NULL, NULL),
	('dbb6a181-67e6-4afd-9377-512b100e2190', 'Adventure Skills Handbook', 'adventure-skills-handbook-dbb6a181', '', '{"Adventure Skills"}', 'sitewide', '00000000-0000-0000-0000-000000000000', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', true, '2025-12-09 15:45:32.861+00', '2025-12-09 15:45:33.135576+00', '2025-12-09 15:46:54.108119+00', 'This PDF provides the requirements for all levels of all Adventure Skills.', '{}', NULL, NULL),
	('e363887b-4f52-4ecb-aa5b-7753641078b1', 'Emergencies Level 1 Session Plan', 'emergencies-level-1-session-plan-e363887b', '<p>Stage 1 introduces the <strong>very basics of emergencies</strong> for younger Scouts, focusing on recognising danger, knowing how to call for help, and understanding simple first-aid concepts. Activities use games and roleplay to teach safety awareness, what counts as an emergency, and how to communicate clearly with adults or emergency services. By the end, youth members understand how to stay safe, keep calm, and alert someone appropriately.</p>', '{Emergencies,"Session Plan"}', 'sitewide', '00000000-0000-0000-0000-000000000000', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', true, '2025-12-09 15:48:16.931+00', '2025-12-09 15:48:17.178837+00', '2025-12-09 15:48:35.150732+00', 'Stage 1 introduces the very basics of emergencies for younger Scouts, focusing on recognising danger, knowing how to call for help, and understanding simple first-aid concepts. Activities use games and roleplay to teach safety awareness, what counts as an emergency, and how to communicate clearly with adults or emergency services. By the end, youth members understand how to stay safe, keep calm, and alert someone appropriately.', '{}', 'Emergencies', NULL),
	('80382881-28f9-4d6d-8a92-fbe0add549f1', 'Scouter Ratios', 'scouter-ratios-80382881', '<p>This official Scouting Ireland document covers Scouter Ratios for 2026.</p>', '{"scouting ireland",ratios}', 'province', '7f4f6004-2124-47e0-931d-c40f7d71bea4', '5ba4f970-d952-4b4e-9470-c021e3efd767', true, '2025-12-05 22:19:59.560244+00', '2025-12-05 22:11:33.825346+00', '2025-12-05 23:30:27.584463+00', 'Scouter Ratios 2026', '{}', NULL, NULL),
	('12fa9b6e-4c8d-492f-858a-41e5207a56dd', 'Emergencies Level 2 Session Plan', 'emergencies-level-2-session-plan-12fa9b6e', '<p>Stage 2 builds on foundational knowledge by teaching Scouts how to perform <strong>simple first-aid actions</strong>, such as treating minor cuts, burns, or nosebleeds, and recognising when someone needs urgent help. Sessions introduce practical skills like the recovery position and basic hazard spotting during activities. At this level, youth members gain more confidence responding to small incidents safely and responsibly.</p>', '{Emergencies,"Session Plan"}', 'sitewide', '00000000-0000-0000-0000-000000000000', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', true, '2025-12-09 15:56:31.918+00', '2025-12-09 15:56:32.169987+00', '2025-12-09 15:56:32.169987+00', 'Stage 2 builds on foundational knowledge by teaching Scouts how to perform simple first-aid actions, such as treating minor cuts, burns, or nosebleeds, and recognising when someone needs urgent help. Sessions introduce practical skills like the recovery position and basic hazard spotting during activities. At this level, youth members gain more confidence responding to small incidents safely and responsibly.
', '{}', 'Emergencies', NULL),
	('80649b8b-b995-427b-b882-a7f9dbe00123', 'Emergencies Level 3 Session Plan', 'emergencies-level-3-session-plan-80649b8b', '<p>Stage 3 develops more advanced understanding, including how to manage <strong>common injuries</strong>, check responsiveness, handle bleeding, and communicate incident details effectively. Scouts also practice planning safe activities, understanding risks, and learning how emergency services locate incidents using directions or features. The level prepares them for more hands-on first aid while reinforcing calm decision-making.</p>', '{Emergencies,"Session Plan"}', 'sitewide', '00000000-0000-0000-0000-000000000000', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', true, '2025-12-09 15:58:13.595+00', '2025-12-09 15:58:13.922713+00', '2025-12-09 15:58:13.922713+00', 'Stage 3 develops more advanced understanding, including how to manage common injuries, check responsiveness, handle bleeding, and communicate incident details effectively. Scouts also practice planning safe activities, understanding risks, and learning how emergency services locate incidents using directions or features. The level prepares them for more hands-on first aid while reinforcing calm decision-making.
', '{}', 'Emergencies', NULL),
	('fc166cc3-3d46-447c-8f18-93c671132c58', 'Emergencies Level 4 Session Plan', 'emergencies-level-3-session-plan-fc166cc3', '<p>Stage 4 focuses on <strong>applied first aid and practical emergency response</strong>, including treating sprains, strains, fractures, choking, poisoning, and blisters. Scouts also learn pioneering skills for building improvisational stretchers, backwoods shelter construction, and safely moving an injured person. The final sessions include scenario-based assessments combining planning, navigation, teamwork, and hands-on emergency care to demonstrate full competence.</p>', '{"Session Plan"}', 'sitewide', '00000000-0000-0000-0000-000000000000', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', true, '2025-12-09 16:00:24.23+00', '2025-12-09 16:00:24.492095+00', '2025-12-09 16:05:18.65048+00', 'Stage 4 focuses on applied first aid and practical emergency response, including treating sprains, strains, fractures, choking, poisoning, and blisters. Scouts also learn pioneering skills for building improvisational stretchers, backwoods shelter construction, and safely moving an injured person. The final sessions include scenario-based assessments combining planning, navigation, teamwork, and hands-on emergency care to demonstrate full competence.
', '{}', 'Emergencies', NULL);


--
-- Data for Name: knowledgebase_article_sections; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: knowledgebase_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."knowledgebase_files" ("id", "article_id", "file_name", "file_url", "file_size", "mime_type", "created_at", "is_embedded", "file_path") VALUES
	('23b49e99-a58e-4018-99d4-7a58520180a5', '80382881-28f9-4d6d-8a92-fbe0add549f1', 'Fiachra O''Broin CSA Certificate.pdf', 'https://kjezhjbxcfgmueqmdjiy.supabase.co/storage/v1/object/public/knowledgebase-files/80382881-28f9-4d6d-8a92-fbe0add549f1/1764976409822-Fiachra%20O''Broin%20CSA%20Certificate.pdf', 3688219, 'application/pdf', '2025-12-05 23:13:31.946074+00', true, '80382881-28f9-4d6d-8a92-fbe0add549f1/1764976409822-Fiachra O''Broin CSA Certificate.pdf'),
	('ba199361-8854-438b-954d-aeb2c5638c5b', '80382881-28f9-4d6d-8a92-fbe0add549f1', 'Joe Keavey CSA Certificate.pdf', 'https://kjezhjbxcfgmueqmdjiy.supabase.co/storage/v1/object/public/knowledgebase-files/80382881-28f9-4d6d-8a92-fbe0add549f1/cntwg.pdf', 3684279, 'application/pdf', '2025-12-05 22:11:36.244981+00', true, NULL),
	('a0bb3fee-4a63-4def-b952-2a2ca0b6eed9', '25b2cf81-f673-4937-af5a-f55eb914e23c', 'Child Safeguarding Statement September 2025.jpeg', 'https://kjezhjbxcfgmueqmdjiy.supabase.co/storage/v1/object/public/knowledgebase-files/25b2cf81-f673-4937-af5a-f55eb914e23c/ok9bvm.jpeg', 846596, 'image/jpeg', '2025-12-09 12:35:55.71141+00', true, '25b2cf81-f673-4937-af5a-f55eb914e23c/ok9bvm.jpeg'),
	('1bad7356-5abc-45c2-a118-736ec6b4b542', 'b107ebd8-a56f-439e-9834-1f8e92f1a97d', 'Safeguarding - Ratios Policy - 09.25.pdf', 'https://kjezhjbxcfgmueqmdjiy.supabase.co/storage/v1/object/public/knowledgebase-files/b107ebd8-a56f-439e-9834-1f8e92f1a97d/x7jpd.pdf', 580038, 'application/pdf', '2025-12-09 11:46:57.712835+00', true, 'b107ebd8-a56f-439e-9834-1f8e92f1a97d/x7jpd.pdf'),
	('e411a3d8-b5e0-481a-9f05-5ad53586a6f9', 'ef74258f-b3ad-452e-a86b-63ac52a812b6', '09CS-First-6-Weeks.pdf', 'https://kjezhjbxcfgmueqmdjiy.supabase.co/storage/v1/object/public/knowledgebase-files/ef74258f-b3ad-452e-a86b-63ac52a812b6/mbckx.pdf', 1026273, 'application/pdf', '2025-12-09 13:03:07.160192+00', true, 'ef74258f-b3ad-452e-a86b-63ac52a812b6/mbckx.pdf'),
	('29cd6691-8c59-4b60-910c-e77ff3055f68', 'dbb6a181-67e6-4afd-9377-512b100e2190', 'Adventure skills handbook.pdf', 'https://kjezhjbxcfgmueqmdjiy.supabase.co/storage/v1/object/public/knowledgebase-files/dbb6a181-67e6-4afd-9377-512b100e2190/2ud05x.pdf', 8516679, 'application/pdf', '2025-12-09 15:45:38.936354+00', true, 'dbb6a181-67e6-4afd-9377-512b100e2190/2ud05x.pdf'),
	('a9442d31-768f-46cf-9187-27d2b7a3f530', 'e363887b-4f52-4ecb-aa5b-7753641078b1', 'Emergencies-Adventure-Skills-Level-1-Session-Plan.pdf', 'https://kjezhjbxcfgmueqmdjiy.supabase.co/storage/v1/object/public/knowledgebase-files/e363887b-4f52-4ecb-aa5b-7753641078b1/75sxj6.pdf', 995991, 'application/pdf', '2025-12-09 15:48:20.342833+00', true, 'e363887b-4f52-4ecb-aa5b-7753641078b1/75sxj6.pdf'),
	('568f256e-21dd-4b7c-9817-90be1e3aa986', '12fa9b6e-4c8d-492f-858a-41e5207a56dd', 'Emergencies-Adventure-Skills-Level-2-Session-Plan.pdf', 'https://kjezhjbxcfgmueqmdjiy.supabase.co/storage/v1/object/public/knowledgebase-files/12fa9b6e-4c8d-492f-858a-41e5207a56dd/ewa7pf.pdf', 501174, 'application/pdf', '2025-12-09 15:56:34.431362+00', false, '12fa9b6e-4c8d-492f-858a-41e5207a56dd/ewa7pf.pdf'),
	('8728873b-bf91-47ee-b023-64c2cd1d6c16', '80649b8b-b995-427b-b882-a7f9dbe00123', 'Emergencies-Adventure-Skills-Level-3-Session-Plan.pdf', 'https://kjezhjbxcfgmueqmdjiy.supabase.co/storage/v1/object/public/knowledgebase-files/80649b8b-b995-427b-b882-a7f9dbe00123/i6k4ns.pdf', 526128, 'application/pdf', '2025-12-09 15:58:16.871695+00', true, '80649b8b-b995-427b-b882-a7f9dbe00123/i6k4ns.pdf'),
	('560a0720-a6d4-4144-99ee-6470fa04ca1f', 'fc166cc3-3d46-447c-8f18-93c671132c58', 'Emergencies-Adventure-Skills-Stage-4-Session-Plan.pdf', 'https://kjezhjbxcfgmueqmdjiy.supabase.co/storage/v1/object/public/knowledgebase-files/fc166cc3-3d46-447c-8f18-93c671132c58/c5l0qd.pdf', 483660, 'application/pdf', '2025-12-09 16:00:27.29699+00', true, 'fc166cc3-3d46-447c-8f18-93c671132c58/c5l0qd.pdf');


--
-- Data for Name: news_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."news_posts" ("id", "title", "slug", "featured_image_url", "body", "tags", "scope_type", "scope_id", "author_id", "published", "published_at", "created_at", "updated_at", "deleted_at", "description") VALUES
	('9cfde7ad-57c3-4cbf-9453-b171313038c4', 'This is a sample news post', 'this-is-a-sample-news-post-9cfde7ad', 'https://kjezhjbxcfgmueqmdjiy.supabase.co/storage/v1/object/public/news-images/province/7f4f6004-2124-47e0-931d-c40f7d71bea4/9cfde7ad-57c3-4cbf-9453-b171313038c4/1764894062104.jpg', '<p>This is long <strong>desc</strong>!</p><p><img class="max-w-full h-auto rounded-md" src="https://kjezhjbxcfgmueqmdjiy.supabase.co/storage/v1/object/public/rich-text-images/5ba4f970-d952-4b4e-9470-c021e3efd767/1764894697040.jpg"></p>', '{test}', 'province', '7f4f6004-2124-47e0-931d-c40f7d71bea4', '5ba4f970-d952-4b4e-9470-c021e3efd767', false, '2025-12-05 00:15:17.053355+00', '2025-12-05 00:12:59.513564+00', '2025-12-08 01:01:37.703946+00', NULL, 'This is short desc'),
	('2d10044d-d3ee-463e-97ed-05e31436940e', 'test', 'test-2d10044d', NULL, '<p>test</p>', '{}', 'province', '7f4f6004-2124-47e0-931d-c40f7d71bea4', '5ba4f970-d952-4b4e-9470-c021e3efd767', false, NULL, '2025-12-05 22:02:48.910014+00', '2025-12-08 01:01:41.26749+00', NULL, 'test'),
	('a7e87ef0-de0a-4ba9-9e06-cd3db457a3ab', 'Western Province Annual Conference 2025', 'western-province-annual-conference-2025-a7e87ef0', 'https://kjezhjbxcfgmueqmdjiy.supabase.co/storage/v1/object/public/news-images/province/7f4f6004-2124-47e0-931d-c40f7d71bea4/1765155768170.jpg', '<p>Last weekend, the Western Province hosted its annual conference. Many awards were handed out and we bid farewell to our outgoing Provincial Commissioner Michelle Comer.</p><p>We were honoured to host a delegation from Scouting Ireland who ran Glór and delivered a talk on the state of the organisation. We are extremely grateful to the Chief Scout for coming down to instate our new Provincial Commisioner Eamon Murray.</p><p>We would also like to congratulate our outgoing PYPR Lorraine Dolan for receiving an honour reward for saving a life last year!</p><p>We wish the best of luck to Eamonn in his new role as PC and we hope Michelle enjoys a well earned retirement 🥳</p><div class="w-full aspect-video rounded-md overflow-hidden"><iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fpermalink.php%3Fstory_fbid%3Dpfbid0CYorxLDLa2FfeRKkYWiMDbiACQCx9GbtMudUaqnfy1R8ZWQjnYinKAdW8erBPJBtl%26id%3D100014230396593&amp;show_text=true&amp;width=500" frameborder="0" allowfullscreen="true" width="500" height="250"></iframe></div><p></p>', '{"annual conference"}', 'province', '7f4f6004-2124-47e0-931d-c40f7d71bea4', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', true, NULL, '2025-12-08 01:03:50.051066+00', '2025-12-08 01:08:57.977914+00', NULL, 'Last weekend, the Western Province hosted its annual conference. Many awards were handed out and we bid farewell to our outgoing Provincial Commissioner Michelle Comer. '),
	('86b60e7c-65b9-4a76-9714-f564b9e88f52', '1st Dublin Achieves Gold Standard', '1st-dublin-achieves-gold-standard-86b60e7c', NULL, '<p>We are thrilled to announce that 1st Dublin Scout Group has achieved Gold Standard accreditation!</p><p>This recognition reflects our commitment to providing high-quality scouting experiences and maintaining excellent standards in all our activities.</p>', '{achievement,gold-standard,1st-dublin}', 'group', '72398f1f-6709-4135-a582-e94e6c6cc9ef', '00000000-0000-0000-0000-000000000001', true, '2025-12-03 22:30:28.933218+00', '2025-12-04 22:30:28.933218+00', '2025-12-08 02:58:48.727478+00', '2025-12-08 02:58:48.493+00', NULL),
	('02cfd456-2bb6-4e20-a0ce-2bb63d6a35ea', 'Leinster Jamboree 2025 - Registration Now Open!', 'leinster-jamboree-2025---registration-now-open-02cfd456', NULL, '<p>We are excited to announce that registration for the Leinster Jamboree 2025 is now open!</p><p>This year''s event will take place in the beautiful Wicklow Mountains and promises to be an unforgettable experience for all participants. Activities include hiking, camping, team challenges, and much more.</p><p>Don''t miss out - register early to secure your place!</p>', '{jamboree,events,leinster,2025}', 'province', 'f52429a2-8c70-4ef1-afb1-001ef292a0ae', '00000000-0000-0000-0000-000000000001', true, '2025-11-29 22:30:28.933218+00', '2025-12-04 22:30:28.933218+00', '2025-12-08 00:28:42.835791+00', '2025-12-08 00:28:40.038+00', NULL),
	('82065cd3-1d4f-419c-8a8e-f2c501829fe1', 'New Leadership Training Programme Launched', 'new-leadership-training-programme-launched-82065cd3', NULL, '<p>Leinster Province is proud to launch a new comprehensive leadership training programme for all adult volunteers.</p><p>The programme covers essential skills including risk management, programme planning, and youth development. Sessions will be held monthly across the province.</p>', '{training,leadership,volunteers}', 'province', 'f52429a2-8c70-4ef1-afb1-001ef292a0ae', '00000000-0000-0000-0000-000000000001', true, '2025-11-22 22:30:28.933218+00', '2025-12-04 22:30:28.933218+00', '2025-12-08 00:28:42.835791+00', '2025-12-08 00:28:40.038+00', NULL),
	('d80ef014-5225-4c4e-a480-e24d311a5fe0', 'Dublin County Camping Weekend Success', 'dublin-county-camping-weekend-success-d80ef014', NULL, '<p>Last weekend saw over 200 scouts from across Dublin County come together for our annual camping weekend.</p><p>The event featured outdoor cooking competitions, orienteering challenges, and campfire sing-alongs. Thank you to all the volunteers who made this event possible!</p>', '{camping,events,dublin}', 'county', '27696f76-b5fa-4437-9427-5d25fa03b616', '00000000-0000-0000-0000-000000000001', true, '2025-12-01 22:30:28.933218+00', '2025-12-04 22:30:28.933218+00', '2025-12-08 02:52:27.867953+00', '2025-12-08 02:52:27.518+00', NULL);


--
-- Data for Name: organization_contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."organization_contacts" ("id", "organization_id", "organization_type", "name", "title", "email", "display_order", "created_at", "updated_at") VALUES
	('c471aa2f-a48a-463d-80f3-c974076ed629', '7f4f6004-2124-47e0-931d-c40f7d71bea4', 'province', 'Noel Leahy', 'Provincial Support Officer', 'nleahy@scouts.ie', 0, '2025-12-08 00:57:45.690399+00', '2025-12-08 00:57:45.690399+00'),
	('1e06415a-7f2d-433b-b4a8-7a1d97f927db', '7f4f6004-2124-47e0-931d-c40f7d71bea4', 'province', 'Eamonn Murray', 'Provincial Commissioner', 'pc.west@scouts.ie', 0, '2025-12-08 00:54:33.599887+00', '2025-12-08 00:54:33.599887+00'),
	('ddf8d3bd-7f2c-4e44-bb7e-ccce579659fe', 'ffa9761a-b44b-4c8f-9026-856fa1b7df88', 'group', 'Ruairi McNicholas', 'Cub Section Lead', 'kilcoonacubs@gmail.com', 0, '2025-12-08 19:14:57.908842+00', '2025-12-08 19:14:57.908842+00');


--
-- Data for Name: organization_members; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: store_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."store_orders" ("id", "scope_type", "scope_id", "user_id", "customer_email", "customer_name", "customer_phone", "total_amount", "stripe_session_id", "stripe_payment_intent_id", "status", "shipping_details", "created_at", "updated_at", "fulfillment_status", "shipped_at") VALUES
	('56174183-842e-4f19-92d1-9dcfe94483c1', 'province', '7f4f6004-2124-47e0-931d-c40f7d71bea4', '5ba4f970-d952-4b4e-9470-c021e3efd767', 'ruairimcn@protonmail.com', 'Ruairi McN', NULL, 13.50, NULL, NULL, 'pending', '{"name": "Ruairi McN", "email": "ruairimcn@protonmail.com"}', '2025-12-06 12:45:19.436347+00', '2025-12-06 12:45:19.436347+00', 'unfulfilled', NULL),
	('25c18116-e36b-4275-b0cd-87756397939a', 'province', '7f4f6004-2124-47e0-931d-c40f7d71bea4', '5ba4f970-d952-4b4e-9470-c021e3efd767', 'ruairimcn@protonmail.com', 'Ruairi McN', NULL, 13.50, NULL, NULL, 'pending', '{"name": "Ruairi McN", "email": "ruairimcn@protonmail.com"}', '2025-12-06 12:45:32.945958+00', '2025-12-06 12:45:32.945958+00', 'unfulfilled', NULL),
	('df69fdfc-1325-40dd-a857-a1dd5c6c7850', 'province', '7f4f6004-2124-47e0-931d-c40f7d71bea4', '5ba4f970-d952-4b4e-9470-c021e3efd767', 'ruairimcn@protonmail.com', 'Ruairi McN', NULL, 13.50, NULL, NULL, 'pending', '{"name": "Ruairi McN", "email": "ruairimcn@protonmail.com"}', '2025-12-06 12:48:54.19956+00', '2025-12-06 12:48:54.19956+00', 'unfulfilled', NULL),
	('635e7920-f771-417c-8d76-82bc24ee1ee4', 'province', '7f4f6004-2124-47e0-931d-c40f7d71bea4', '5ba4f970-d952-4b4e-9470-c021e3efd767', 'ruairi@propellerdigital.ie', 'Ruairi McNicholas', NULL, 13.50, NULL, NULL, 'pending', '{"name": "Ruairi McNicholas", "email": "ruairi@propellerdigital.ie", "phone": "+353867304673", "billing": {"city": "Galway", "line1": "Donaghpatrick, Headford", "line2": "Headford", "county": "Galway", "eircode": "H91V2T7"}, "lastName": "McNicholas", "shipping": {"city": "Galway", "line1": "Donaghpatrick, Headford", "line2": "Headford", "county": "Galway", "eircode": "H91V2T7"}, "firstName": "Ruairi"}', '2025-12-06 14:30:00.218128+00', '2025-12-06 14:30:00.218128+00', 'unfulfilled', NULL),
	('fe1228e5-e526-4a7f-a248-e8154694dcda', 'province', '7f4f6004-2124-47e0-931d-c40f7d71bea4', '5ba4f970-d952-4b4e-9470-c021e3efd767', 'ruairi@propellerdigital.ie', 'Ruairi McNicholas', NULL, 13.50, NULL, NULL, 'pending', '{"name": "Ruairi McNicholas", "email": "ruairi@propellerdigital.ie", "phone": "+353867304673", "billing": {"city": "Galway", "line1": "Donaghpatrick, Headford", "line2": "Headford", "county": "Galway", "eircode": "H91V2T7"}, "lastName": "McNicholas", "shipping": {"city": "Galway", "line1": "Donaghpatrick, Headford", "line2": "Headford", "county": "Galway", "eircode": "H91V2T7"}, "firstName": "Ruairi"}', '2025-12-06 14:51:04.220265+00', '2025-12-06 14:51:04.220265+00', 'unfulfilled', NULL),
	('39c611bb-1912-4046-af72-a3ab8e0199c6', 'province', '7f4f6004-2124-47e0-931d-c40f7d71bea4', '5ba4f970-d952-4b4e-9470-c021e3efd767', 'ruairi@propellerdigital.ie', 'Ruairi McNicholas', NULL, 13.50, NULL, NULL, 'pending', '{"name": "Ruairi McNicholas", "email": "ruairi@propellerdigital.ie", "phone": "+353867304673", "billing": {"city": "Galway", "line1": "Donaghpatrick, Headford", "line2": "Headford", "county": "Galway", "eircode": "H91V2T7"}, "lastName": "McNicholas", "shipping": {"city": "Galway", "line1": "Donaghpatrick, Headford", "line2": "Headford", "county": "Galway", "eircode": "H91V2T7"}, "firstName": "Ruairi"}', '2025-12-06 18:24:23.161393+00', '2025-12-06 18:24:23.161393+00', 'unfulfilled', NULL),
	('4ead7ad5-2013-4be1-93cd-e91579166872', 'province', '7f4f6004-2124-47e0-931d-c40f7d71bea4', '5ba4f970-d952-4b4e-9470-c021e3efd767', 'ruairi@propellerdigital.ie', 'Ruairi McNicholas', NULL, 13.50, NULL, NULL, 'pending', '{"name": "Ruairi McNicholas", "email": "ruairi@propellerdigital.ie", "phone": "+353867304673", "billing": {"city": "Galway", "line1": "Donaghpatrick, Headford", "line2": "Headford", "county": "Galway", "eircode": "H91V2T7"}, "lastName": "McNicholas", "shipping": {"city": "Galway", "line1": "Donaghpatrick, Headford", "line2": "Headford", "county": "Galway", "eircode": "H91V2T7"}, "firstName": "Ruairi"}', '2025-12-07 02:02:45.216719+00', '2025-12-07 02:02:45.216719+00', 'unfulfilled', NULL),
	('a3eb28a4-6515-4c78-8efc-387bc4e4f5c5', 'province', '7f4f6004-2124-47e0-931d-c40f7d71bea4', '5ba4f970-d952-4b4e-9470-c021e3efd767', 'ruairi@propellerdigital.ie', 'Ruairi McNicholas', NULL, 13.50, NULL, NULL, 'pending', '{"name": "Ruairi McNicholas", "email": "ruairi@propellerdigital.ie", "phone": "+353867304673", "billing": {"city": "Galway", "line1": "Donaghpatrick, Headford", "line2": "Headford", "county": "Galway", "eircode": "H91V2T7"}, "lastName": "McNicholas", "shipping": {"city": "Galway", "line1": "Donaghpatrick, Headford", "line2": "Headford", "county": "Galway", "eircode": "H91V2T7"}, "firstName": "Ruairi"}', '2025-12-07 02:13:01.162617+00', '2025-12-07 02:13:01.162617+00', 'unfulfilled', NULL),
	('68f2fe3c-de20-442d-ab3a-f9e941ee5210', 'province', '7f4f6004-2124-47e0-931d-c40f7d71bea4', '5ba4f970-d952-4b4e-9470-c021e3efd767', 'ruairi@propellerdigital.ie', 'Ruairi McNicholas', NULL, 13.50, NULL, NULL, 'pending', '{"name": "Ruairi McNicholas", "email": "ruairi@propellerdigital.ie", "phone": "+353867304673", "billing": {"city": "Galway", "line1": "Donaghpatrick, Headford", "line2": "Headford", "county": "Galway", "eircode": "H91V2T7"}, "lastName": "McNicholas", "shipping": {"city": "Galway", "line1": "Donaghpatrick, Headford", "line2": "Headford", "county": "Galway", "eircode": "H91V2T7"}, "firstName": "Ruairi"}', '2025-12-07 02:19:10.175695+00', '2025-12-07 02:19:10.175695+00', 'unfulfilled', NULL),
	('559a8115-a1bb-4afa-9f41-114ab80d52a6', 'province', '7f4f6004-2124-47e0-931d-c40f7d71bea4', '5ba4f970-d952-4b4e-9470-c021e3efd767', 'ruairi@propellerdigital.ie', 'Ruairi McNicholas', NULL, 13.50, NULL, 'pi_3SbXdSRh2yNX0Ell0j8eV0YZ', 'paid', '{"name": "Ruairi McNicholas", "email": "ruairi@propellerdigital.ie", "phone": "+353867304673", "billing": {"city": "Galway", "line1": "Donaghpatrick, Headford", "line2": "Headford", "county": "Galway", "eircode": "H91V2T7"}, "lastName": "McNicholas", "shipping": {"city": "Galway", "line1": "Donaghpatrick, Headford", "line2": "Headford", "county": "Galway", "eircode": "H91V2T7"}, "firstName": "Ruairi"}', '2025-12-07 02:22:41.059898+00', '2025-12-07 02:40:20.856381+00', 'shipped', '2025-12-07 02:40:20.754+00'),
	('de9aa460-f316-40c3-af5b-eb0f773bfbd9', 'province', '7f4f6004-2124-47e0-931d-c40f7d71bea4', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', 'ruairi@propellerdigital.ie', 'Ruairi McNicholas', NULL, 24.00, NULL, NULL, 'pending', '{"name": "Ruairi McNicholas", "email": "ruairi@propellerdigital.ie", "phone": "+353867304673", "billing": {"city": "Galway", "line1": "Donaghpatrick, Headford", "line2": "Headford", "county": "Galway", "eircode": "H91V2T7"}, "lastName": "McNicholas", "shipping": {"city": "Galway", "line1": "Donaghpatrick, Headford", "line2": "Headford", "county": "Galway", "eircode": "H91V2T7"}, "firstName": "Ruairi"}', '2025-12-08 10:28:18.384285+00', '2025-12-08 10:28:18.384285+00', 'unfulfilled', NULL);


--
-- Data for Name: store_products; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."store_products" ("id", "scope_type", "scope_id", "title", "short_description", "description", "price", "quantity", "tags", "available_from", "available_to", "shipping_enabled", "shipping_mode", "shipping_cost", "published", "created_at", "updated_at", "image_url") VALUES
	('11ed917a-cd1a-4ad0-b575-bf402689d464', 'province', '7f4f6004-2124-47e0-931d-c40f7d71bea4', 'Scout Survivor Badge', 'Scout Survivor Badges for Delta, Beta, and Alpha', '<p>Scout Survivor Badges for Delta, Beta, and Alpha</p><p>Scouts must complete a given <strong>level </strong>to <strong>get the badge.</strong></p>', 10.50, NULL, '{badges,survivor}', NULL, NULL, true, 'flat_rate', 3.00, true, '2025-12-06 01:22:18.666681+00', '2025-12-06 12:44:37.973557+00', 'https://kjezhjbxcfgmueqmdjiy.supabase.co/storage/v1/object/public/store-products/1764984062024-oakmi.png');


--
-- Data for Name: store_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."store_order_items" ("id", "order_id", "product_id", "quantity", "unit_price", "total_price", "created_at") VALUES
	('7204c44d-f74d-4266-a3b1-a9c9d1d85c8a', '56174183-842e-4f19-92d1-9dcfe94483c1', '11ed917a-cd1a-4ad0-b575-bf402689d464', 1, 10.50, 10.50, '2025-12-06 12:45:19.544542+00'),
	('2523cdee-8cba-4e68-a355-11a926baa3d0', '25c18116-e36b-4275-b0cd-87756397939a', '11ed917a-cd1a-4ad0-b575-bf402689d464', 1, 10.50, 10.50, '2025-12-06 12:45:33.032905+00'),
	('32c8d22f-e3ab-4eec-8d44-d70e96498798', 'df69fdfc-1325-40dd-a857-a1dd5c6c7850', '11ed917a-cd1a-4ad0-b575-bf402689d464', 1, 10.50, 10.50, '2025-12-06 12:48:54.285345+00'),
	('e96ab2a8-a50b-4478-a9b8-dec097157e77', '635e7920-f771-417c-8d76-82bc24ee1ee4', '11ed917a-cd1a-4ad0-b575-bf402689d464', 1, 10.50, 10.50, '2025-12-06 14:30:00.29822+00'),
	('6b06d142-4f6d-4727-b880-d61e2579fa7b', 'fe1228e5-e526-4a7f-a248-e8154694dcda', '11ed917a-cd1a-4ad0-b575-bf402689d464', 1, 10.50, 10.50, '2025-12-06 14:51:04.331016+00'),
	('4b8553e3-8a34-48b1-a918-6c4002f37d6c', '39c611bb-1912-4046-af72-a3ab8e0199c6', '11ed917a-cd1a-4ad0-b575-bf402689d464', 1, 10.50, 10.50, '2025-12-06 18:24:23.253992+00'),
	('306be6b7-b071-4af0-9557-bf75529d0cd2', '4ead7ad5-2013-4be1-93cd-e91579166872', '11ed917a-cd1a-4ad0-b575-bf402689d464', 1, 10.50, 10.50, '2025-12-07 02:02:45.30842+00'),
	('6e7e4542-0877-45be-92dc-da8e80c01a5b', 'a3eb28a4-6515-4c78-8efc-387bc4e4f5c5', '11ed917a-cd1a-4ad0-b575-bf402689d464', 1, 10.50, 10.50, '2025-12-07 02:13:01.242752+00'),
	('5b03062c-ecdb-455d-90a5-9e283f4d7804', '68f2fe3c-de20-442d-ab3a-f9e941ee5210', '11ed917a-cd1a-4ad0-b575-bf402689d464', 1, 10.50, 10.50, '2025-12-07 02:19:10.281326+00'),
	('e74c9c6e-05cc-45b9-bb3b-d69bad73267c', '559a8115-a1bb-4afa-9f41-114ab80d52a6', '11ed917a-cd1a-4ad0-b575-bf402689d464', 1, 10.50, 10.50, '2025-12-07 02:22:41.139345+00'),
	('dfe08204-46d2-4fb4-a471-a8bbd4f21646', 'de9aa460-f316-40c3-af5b-eb0f773bfbd9', '11ed917a-cd1a-4ad0-b575-bf402689d464', 2, 10.50, 21.00, '2025-12-08 10:28:18.525662+00');


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."tags" ("id", "name", "created_at") VALUES
	('8d19d5eb-c063-4473-a279-45548b61dc44', 'camping', '2025-12-09 16:34:27.820274+00'),
	('cdca996f-8056-4c23-b612-b43ee1dbddcf', 'annual-camp', '2025-12-09 16:34:27.820274+00'),
	('e60932ed-ddeb-4e68-b1f2-a761b99e0864', 'training', '2025-12-09 16:34:27.820274+00'),
	('13809c94-7af4-424e-8860-e47801f80dbc', 'jamboree', '2025-12-09 16:34:27.820274+00'),
	('0d0515a4-b4fd-4115-bdac-1db18c39c669', 'National Event', '2025-12-09 16:34:27.820274+00'),
	('8d857fab-1b0c-4952-98ed-8721273d8723', 'night hike', '2025-12-09 16:34:27.820274+00'),
	('63331c64-fbda-44c8-adac-406ef605cfde', 'scouters', '2025-12-09 16:34:27.820274+00'),
	('9e99282e-e94e-420a-bb06-46924dc1d6d4', 'clonbur', '2025-12-09 16:34:27.820274+00'),
	('d6984ff7-c961-409f-a320-985594b7f39a', 'skills', '2025-12-09 16:34:27.820274+00'),
	('91416add-fdde-4747-ac29-ff2e8c6a0935', 'leadership', '2025-12-09 16:34:27.820274+00'),
	('e8729ea2-80ca-4861-ab6e-317d87cd4c61', 'Survivor', '2025-12-09 16:34:27.820274+00'),
	('e678af9d-1e6e-4317-bc22-a3fa30b7f0e4', 'adventure', '2025-12-09 16:34:27.820274+00'),
	('f55f5fed-1447-4962-9f2c-c6922d98bf55', 'workshop', '2025-12-09 16:34:27.820274+00'),
	('cfbb5cbf-7c32-43d4-8b25-25475cdd68a2', '1st-dublin', '2025-12-09 16:34:27.820274+00'),
	('f6cd11e6-e318-48fc-aafd-e1353a7c9b65', 'volunteers', '2025-12-09 16:34:27.820274+00'),
	('e208c75b-a115-4e64-abae-518e42cce1c0', 'leinster', '2025-12-09 16:34:27.820274+00'),
	('960d0433-75f8-4b7f-90cb-0e6162d0711b', 'test', '2025-12-09 16:34:27.820274+00'),
	('d4e888f7-53f0-42e3-9ec5-5b7f7641a2d2', 'achievement', '2025-12-09 16:34:27.820274+00'),
	('85a38d55-a53f-4de5-80f8-02c6e8758041', 'annual conference', '2025-12-09 16:34:27.820274+00'),
	('ad2b322e-cbc3-496c-88ca-7adc4bcea780', 'gold-standard', '2025-12-09 16:34:27.820274+00'),
	('fa830c7e-5ce2-4523-bb18-38f044bb225c', 'dublin', '2025-12-09 16:34:27.820274+00'),
	('9f7c8451-955d-4f03-923c-d9ed11faa8b8', '2025', '2025-12-09 16:34:27.820274+00'),
	('d0f9a50d-c134-4d65-82e8-c39fbc9638fc', 'events', '2025-12-09 16:34:27.820274+00'),
	('b9d706be-1cca-4c95-91d7-e9205e96d88a', 'safety', '2025-12-09 16:34:27.820274+00'),
	('aef3c91f-7dee-4e9a-937b-afd5ea3fbbee', 'Session Plan', '2025-12-09 16:34:27.820274+00'),
	('574712d8-1646-49ad-b778-227fbee740c0', 'resources', '2025-12-09 16:34:27.820274+00'),
	('f1a32fe5-e769-4f1b-8d84-5be8a6a3b5c8', 'ratios', '2025-12-09 16:34:27.820274+00'),
	('4d2c2fff-2d5a-4ccf-8fc9-21261bbe8140', 'Starting off', '2025-12-09 16:34:27.820274+00'),
	('08e2e4c4-713f-4b71-9098-0a5b12ce42d1', 'Safeguarding', '2025-12-09 16:34:27.820274+00'),
	('034b50aa-ec58-4700-ad76-10d31d392995', 'Cub Scout Resources', '2025-12-09 16:34:27.820274+00'),
	('fff1de28-4098-4672-95fa-c3ae82850aa0', 'procedures', '2025-12-09 16:34:27.820274+00'),
	('674d396c-20ce-4008-8739-27c438aac743', 'policies', '2025-12-09 16:34:27.820274+00'),
	('fcdf57db-f6ca-4e52-80e1-eafc2c7cb084', 'Official Scouting Ireland Documents', '2025-12-09 16:34:27.820274+00'),
	('fd014cd7-a96e-49f2-afc4-9f6382263d50', 'information', '2025-12-09 16:34:27.820274+00'),
	('19154247-3052-4ee2-b35c-847962494101', 'Ratios', '2025-12-09 16:34:27.820274+00'),
	('c15bf2ce-226d-4d24-9b38-11e3d0ca60ab', 'handbook', '2025-12-09 16:34:27.820274+00'),
	('2da073c5-9e0b-47ae-85d8-aa0151ea4724', 'checklist', '2025-12-09 16:34:27.820274+00'),
	('2e6ea28f-4cd8-4134-8348-d7006b5d6c33', 'Adventure Skills', '2025-12-09 16:34:27.820274+00'),
	('ba78c588-4d4c-4219-933b-3f5f0f1ef2d4', 'Emergencies', '2025-12-09 16:34:27.820274+00'),
	('0f944d9b-10e8-4fa3-8021-f4bc200fa997', 'scouting ireland', '2025-12-09 16:34:27.820274+00'),
	('7774b71c-d6b6-43fb-b750-049cd02ce1b2', 'campsites', '2025-12-09 16:34:27.820274+00'),
	('22c9c23d-1d3a-4acc-976d-4ab24e4a1665', 'planning', '2025-12-09 16:34:27.820274+00');


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."tickets" ("id", "user_id", "type", "subject", "description", "status", "created_at", "updated_at") VALUES
	('de50a857-9ad9-4944-b2ea-6eaae44c6c13', '5ba4f970-d952-4b4e-9470-c021e3efd767', 'bug_report', 'Issue creating new event....', '<p>There is a bug with...</p>', 'open', '2025-12-08 10:14:29.69364+00', '2025-12-08 10:14:29.69364+00');


--
-- Data for Name: ticket_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: ticket_replies; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."user_roles" ("id", "user_id", "role", "scope_type", "scope_id", "created_at", "updated_at", "permissions") VALUES
	('9d15dd38-0fa5-4503-afe9-fb57d242783d', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', 'sysadmin', 'system', NULL, '2025-12-04 23:00:31.042105+00', '2025-12-04 23:00:31.042105+00', '{}'),
	('cd1748fb-1fb1-48a9-be78-3243ab242afd', '0b690928-fdac-4ea4-847f-5190521ddfe0', 'group_leader', 'group', 'ffa9761a-b44b-4c8f-9026-856fa1b7df88', '2025-12-09 11:00:53.609275+00', '2025-12-09 11:00:53.609275+00', '{"news": true, "admin": true, "store": true, "events": true, "financial": true, "section_id": "ce3be66a-4f36-4e57-87b9-e9b7eeaa6921", "org_details": true, "is_section_lead": true}'),
	('d55eda62-5c23-48b8-a958-676425698c6f', '0b690928-fdac-4ea4-847f-5190521ddfe0', 'team_admin', 'adventure_team', 'fd76c3e4-f7ea-46d8-8bb3-8e889d5ef79e', '2025-12-09 11:24:17.078882+00', '2025-12-09 11:24:17.078882+00', '{"news": true, "admin": true, "store": true, "events": true, "financial": true, "section_id": null, "org_details": true, "is_section_lead": false}'),
	('63d929be-3b35-4557-99dc-b0221a8f52b8', '30d04492-d7dc-4fe8-8686-96b21d006170', 'group_leader', 'group', 'ffa9761a-b44b-4c8f-9026-856fa1b7df88', '2025-12-08 19:44:11.262842+00', '2025-12-09 11:38:34.428612+00', '{"news": true, "admin": true, "store": true, "events": true, "financial": true, "section_id": "4baeb589-d46e-4ab1-be55-c372cdc1a3ab", "org_details": true, "is_section_lead": true}'),
	('ac844dfa-8c56-498f-a598-05fc7d44268a', '5ba4f970-d952-4b4e-9470-c021e3efd767', 'provincial_admin', 'province', '7f4f6004-2124-47e0-931d-c40f7d71bea4', '2025-12-04 23:56:18.950011+00', '2025-12-09 16:58:32.096+00', '{"news": true, "admin": true, "store": true, "events": true, "financial": true, "org_details": true}');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
	('organization-logos', 'organization-logos', NULL, '2025-12-04 23:28:15.538199+00', '2025-12-04 23:28:15.538199+00', true, false, 5242880, '{image/jpeg,image/png,image/gif,image/webp,image/svg+xml}', NULL, 'STANDARD'),
	('news-images', 'news-images', NULL, '2025-12-05 00:12:53.039756+00', '2025-12-05 00:12:53.039756+00', true, false, 10485760, '{image/jpeg,image/png,image/gif,image/webp,image/svg+xml}', NULL, 'STANDARD'),
	('rich-text-images', 'rich-text-images', NULL, '2025-12-05 00:30:12.599279+00', '2025-12-05 00:30:12.599279+00', true, false, 10485760, '{image/jpeg,image/png,image/gif,image/webp,image/svg+xml}', NULL, 'STANDARD'),
	('knowledgebase-files', 'knowledgebase-files', NULL, '2025-12-05 21:50:18.779711+00', '2025-12-05 21:50:18.779711+00', true, false, NULL, NULL, NULL, 'STANDARD'),
	('store-products', 'store-products', NULL, '2025-12-06 01:19:35.428813+00', '2025-12-06 01:19:35.428813+00', true, false, NULL, NULL, NULL, 'STANDARD'),
	('ticket-attachments', 'ticket-attachments', NULL, '2025-12-08 18:59:10.07833+00', '2025-12-08 18:59:10.07833+00', true, false, NULL, NULL, NULL, 'STANDARD'),
	('organization-assets', 'organization-assets', NULL, '2025-12-08 19:00:00+00', '2025-12-08 19:00:00+00', true, false, 10485760, '{image/jpeg,image/png,image/gif,image/webp,image/svg+xml}', NULL, 'STANDARD')
ON CONFLICT (id) DO NOTHING;


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata", "level") VALUES
	('54f9d1f0-7456-4856-bd90-5a82dc2af082', 'organization-logos', 'province/7f4f6004-2124-47e0-931d-c40f7d71bea4/1764891186275.png', NULL, '2025-12-04 23:33:06.527664+00', '2025-12-04 23:33:06.527664+00', '2025-12-04 23:33:06.527664+00', '{"eTag": "\"6d5ab3b4c19161b2860ce2c2c06f9663\"", "size": 41573, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-12-04T23:33:07.000Z", "contentLength": 41573, "httpStatusCode": 200}', 'ad51cd7f-2869-42dc-9d9b-3651c146a07a', NULL, '{}', 3),
	('5d0ea093-f549-4d97-b614-024bfb2294c2', 'organization-logos', 'county/09c9f169-af0a-4ef4-be06-82719ef4da55/1764891768944.png', NULL, '2025-12-04 23:42:49.183476+00', '2025-12-04 23:42:49.183476+00', '2025-12-04 23:42:49.183476+00', '{"eTag": "\"6d5ab3b4c19161b2860ce2c2c06f9663\"", "size": 41573, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-12-04T23:42:50.000Z", "contentLength": 41573, "httpStatusCode": 200}', '28c70d79-50ec-4bd3-873f-b7068ec5b962', NULL, '{}', 3),
	('77bf2945-8642-4a9d-a94a-0e7c6d944f91', 'organization-logos', 'county/09c9f169-af0a-4ef4-be06-82719ef4da55/1764891853490.png', NULL, '2025-12-04 23:44:13.6748+00', '2025-12-04 23:44:13.6748+00', '2025-12-04 23:44:13.6748+00', '{"eTag": "\"73d938cc2f0595b36969a6b63c0a479d\"", "size": 10419, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-12-04T23:44:14.000Z", "contentLength": 10419, "httpStatusCode": 200}', '36578033-de8a-4c1f-9fe8-b0c72dfc3608', NULL, '{}', 3),
	('6d74387c-651d-4b08-9b81-18306d23bd54', 'organization-logos', 'province/babdf52c-ffbe-4077-b8f8-eda6c942e1ff/1764892014428.png', NULL, '2025-12-04 23:46:55.108165+00', '2025-12-04 23:46:55.108165+00', '2025-12-04 23:46:55.108165+00', '{"eTag": "\"bf0bbecf4a55c3d52a83862458fdf22f\"", "size": 1138860, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-12-04T23:46:56.000Z", "contentLength": 1138860, "httpStatusCode": 200}', '83e0067a-7fca-422d-8f4a-c44483615051', NULL, '{}', 3),
	('236acc3a-cf7a-4e7e-84df-5b9926902d30', 'news-images', 'province/7f4f6004-2124-47e0-931d-c40f7d71bea4/9cfde7ad-57c3-4cbf-9453-b171313038c4/1764893679612.jpg', NULL, '2025-12-05 00:14:40.046856+00', '2025-12-05 00:14:40.046856+00', '2025-12-05 00:14:40.046856+00', '{"eTag": "\"59a5ebbce562099dfd0184565926ae7b\"", "size": 147443, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-05T00:14:40.000Z", "contentLength": 147443, "httpStatusCode": 200}', '6a57ec24-6119-4861-a69f-ecee14f1d4b9', NULL, '{}', 4),
	('5843687b-9217-4708-838c-6b032882a27d', 'news-images', 'province/7f4f6004-2124-47e0-931d-c40f7d71bea4/9cfde7ad-57c3-4cbf-9453-b171313038c4/1764894062104.jpg', NULL, '2025-12-05 00:21:02.438074+00', '2025-12-05 00:21:02.438074+00', '2025-12-05 00:21:02.438074+00', '{"eTag": "\"59a5ebbce562099dfd0184565926ae7b\"", "size": 147443, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-05T00:21:03.000Z", "contentLength": 147443, "httpStatusCode": 200}', 'ee6e1d03-9281-4eec-8504-08e159db8fd7', NULL, '{}', 4),
	('43fa5452-17a1-4e5e-87f0-2b329f7c4dcb', 'rich-text-images', '5ba4f970-d952-4b4e-9470-c021e3efd767/1764894685414.jpg', NULL, '2025-12-05 00:31:25.761627+00', '2025-12-05 00:31:25.761627+00', '2025-12-05 00:31:25.761627+00', '{"eTag": "\"61215c6a77a78fb1fae01289017b7430\"", "size": 38559, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-05T00:31:26.000Z", "contentLength": 38559, "httpStatusCode": 200}', 'ad3fcc67-f339-41c4-abd1-1ef4a5aa6195', NULL, '{}', 2),
	('f56aaba1-a76d-454b-a96e-739ef9ca0e4a', 'rich-text-images', '5ba4f970-d952-4b4e-9470-c021e3efd767/1764894697040.jpg', NULL, '2025-12-05 00:31:37.22587+00', '2025-12-05 00:31:37.22587+00', '2025-12-05 00:31:37.22587+00', '{"eTag": "\"61215c6a77a78fb1fae01289017b7430\"", "size": 38559, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-05T00:31:38.000Z", "contentLength": 38559, "httpStatusCode": 200}', '272fd661-52bd-4288-81d6-135994aba557', NULL, '{}', 2),
	('481e6fa2-816e-48a7-a258-a7742e9a8f8b', 'news-images', 'province/7f4f6004-2124-47e0-931d-c40f7d71bea4/1764896496877.png', NULL, '2025-12-05 01:01:37.373914+00', '2025-12-05 01:01:37.373914+00', '2025-12-05 01:01:37.373914+00', '{"eTag": "\"d9082512e8f69118e65a8630263106e3\"", "size": 355791, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-12-05T01:01:38.000Z", "contentLength": 355791, "httpStatusCode": 200}', 'e30dc363-efca-4384-ad99-a623d3d85853', NULL, '{}', 3),
	('17db0098-5044-40da-8cee-9b947a2c4724', 'knowledgebase-files', '80382881-28f9-4d6d-8a92-fbe0add549f1/cntwg.pdf', '5ba4f970-d952-4b4e-9470-c021e3efd767', '2025-12-05 22:11:35.990641+00', '2025-12-05 22:11:35.990641+00', '2025-12-05 22:11:35.990641+00', '{"eTag": "\"8fe59c05349320abe1f6e9af7ab6677b\"", "size": 3684279, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-12-05T22:11:36.000Z", "contentLength": 3684279, "httpStatusCode": 200}', '74918374-87c9-4e13-97e3-62b0871c1f8c', '5ba4f970-d952-4b4e-9470-c021e3efd767', '{}', 2),
	('47518ed5-859a-4a69-bbf2-e94ea0e047fa', 'knowledgebase-files', '80382881-28f9-4d6d-8a92-fbe0add549f1/1764975077894-Noah Waldron CSA Certificate.pdf', '5ba4f970-d952-4b4e-9470-c021e3efd767', '2025-12-05 22:51:20.411657+00', '2025-12-05 22:51:20.411657+00', '2025-12-05 22:51:20.411657+00', '{"eTag": "\"3a0f684a43da19e6920f1a10be51c378\"", "size": 3684666, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-12-05T22:51:21.000Z", "contentLength": 3684666, "httpStatusCode": 200}', 'a93e8c82-62ce-4dcd-b169-91616352bfa7', '5ba4f970-d952-4b4e-9470-c021e3efd767', '{}', 2),
	('ca561a0b-d4fb-45c4-b3c1-7799343d2f02', 'rich-text-images', '6d63d9e6-316c-4b29-bf6b-7ff03b623328/1765157294681.jpg', NULL, '2025-12-08 01:28:17.539216+00', '2025-12-08 01:28:17.539216+00', '2025-12-08 01:28:17.539216+00', '{"eTag": "\"56185f284e22cceb046d795c13ee3bea\"", "size": 283013, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-08T01:28:18.000Z", "contentLength": 283013, "httpStatusCode": 200}', '54168b2e-cd37-4052-9f3d-7d73557a9dbc', NULL, '{}', 2),
	('b06472e7-1689-4697-8b44-78bdd6fb3373', 'knowledgebase-files', '80382881-28f9-4d6d-8a92-fbe0add549f1/1764975381973-Noah Waldron CSA Certificate.pdf', '5ba4f970-d952-4b4e-9470-c021e3efd767', '2025-12-05 22:56:23.743096+00', '2025-12-05 22:56:23.743096+00', '2025-12-05 22:56:23.743096+00', '{"eTag": "\"3a0f684a43da19e6920f1a10be51c378\"", "size": 3684666, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-12-05T22:56:24.000Z", "contentLength": 3684666, "httpStatusCode": 200}', '6e6a964d-a39f-4ba3-b632-6106c987e94c', '5ba4f970-d952-4b4e-9470-c021e3efd767', '{}', 2),
	('6aec5a7d-b74f-4aa6-b568-f5222dfec648', 'knowledgebase-files', '80382881-28f9-4d6d-8a92-fbe0add549f1/1764975904027-Fiachra O''Broin CSA Certificate.pdf', '5ba4f970-d952-4b4e-9470-c021e3efd767', '2025-12-05 23:05:05.777753+00', '2025-12-05 23:05:05.777753+00', '2025-12-05 23:05:05.777753+00', '{"eTag": "\"a86b6f81b270d5672eedfa5588a3ab13\"", "size": 3688219, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-12-05T23:05:06.000Z", "contentLength": 3688219, "httpStatusCode": 200}', '53e6a830-a847-4adf-958f-867da4db38f8', '5ba4f970-d952-4b4e-9470-c021e3efd767', '{}', 2),
	('006a62ce-3b65-4ee2-94d3-21a3db999788', 'knowledgebase-files', '80382881-28f9-4d6d-8a92-fbe0add549f1/1764976133460-Fiachra O''Broin CSA Certificate.pdf', '5ba4f970-d952-4b4e-9470-c021e3efd767', '2025-12-05 23:08:55.436612+00', '2025-12-05 23:08:55.436612+00', '2025-12-05 23:08:55.436612+00', '{"eTag": "\"a86b6f81b270d5672eedfa5588a3ab13\"", "size": 3688219, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-12-05T23:08:56.000Z", "contentLength": 3688219, "httpStatusCode": 200}', '05bfee4d-c42f-447f-8153-00b500051bc8', '5ba4f970-d952-4b4e-9470-c021e3efd767', '{}', 2),
	('1d0895a0-f172-452a-bff5-6d501e231d3f', 'knowledgebase-files', '80382881-28f9-4d6d-8a92-fbe0add549f1/1764976150637-Fiachra O''Broin CSA Certificate.pdf', '5ba4f970-d952-4b4e-9470-c021e3efd767', '2025-12-05 23:09:13.29787+00', '2025-12-05 23:09:13.29787+00', '2025-12-05 23:09:13.29787+00', '{"eTag": "\"a86b6f81b270d5672eedfa5588a3ab13\"", "size": 3688219, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-12-05T23:09:14.000Z", "contentLength": 3688219, "httpStatusCode": 200}', '9a8945df-9e7c-40a3-a13a-a9fee6397684', '5ba4f970-d952-4b4e-9470-c021e3efd767', '{}', 2),
	('41750f2d-53ad-4cf8-a6c7-e62cbf852d20', 'knowledgebase-files', '80382881-28f9-4d6d-8a92-fbe0add549f1/1764976409822-Fiachra O''Broin CSA Certificate.pdf', '5ba4f970-d952-4b4e-9470-c021e3efd767', '2025-12-05 23:13:31.738059+00', '2025-12-05 23:13:31.738059+00', '2025-12-05 23:13:31.738059+00', '{"eTag": "\"a86b6f81b270d5672eedfa5588a3ab13\"", "size": 3688219, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-12-05T23:13:32.000Z", "contentLength": 3688219, "httpStatusCode": 200}', '6bf74f75-a254-4328-b448-92940bd52017', '5ba4f970-d952-4b4e-9470-c021e3efd767', '{}', 2),
	('9783cd94-a746-495c-8aab-86d62999f102', 'store-products', '1764984062024-oakmi.png', '5ba4f970-d952-4b4e-9470-c021e3efd767', '2025-12-06 01:21:02.709878+00', '2025-12-06 01:21:02.709878+00', '2025-12-06 01:21:02.709878+00', '{"eTag": "\"d9082512e8f69118e65a8630263106e3\"", "size": 355791, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-12-06T01:21:03.000Z", "contentLength": 355791, "httpStatusCode": 200}', 'f550e39e-e7e7-446e-8c49-4d63012a4dc2', '5ba4f970-d952-4b4e-9470-c021e3efd767', '{}', 1),
	('8f4640e5-634f-4c0b-8bf1-0a9f584bb63f', 'news-images', 'province/7f4f6004-2124-47e0-931d-c40f7d71bea4/1765027323899.webp', NULL, '2025-12-06 13:22:04.309088+00', '2025-12-06 13:22:04.309088+00', '2025-12-06 13:22:04.309088+00', '{"eTag": "\"5c9d4aeda63a9b8b43f26aee3f6df96b\"", "size": 19250, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2025-12-06T13:22:05.000Z", "contentLength": 19250, "httpStatusCode": 200}', '23e2eac3-ef86-4fa5-9004-4fbcd6b7dfdc', NULL, '{}', 3),
	('49e14465-0d2f-4b48-b5f2-22dc4d5b474d', 'news-images', 'province/7f4f6004-2124-47e0-931d-c40f7d71bea4/1765155768170.jpg', NULL, '2025-12-08 01:02:50.366915+00', '2025-12-08 01:02:50.366915+00', '2025-12-08 01:02:50.366915+00', '{"eTag": "\"2cc49d05425aadc4bfd3819b54bf78bd\"", "size": 133456, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-08T01:02:51.000Z", "contentLength": 133456, "httpStatusCode": 200}', '867bd1bc-ee6c-471f-9bf0-f2a0bd3a50f6', NULL, '{}', 3),
	('ba187b2e-d79b-447e-9ac6-9b2228cbb628', 'news-images', 'province/7f4f6004-2124-47e0-931d-c40f7d71bea4/1765157216838.jpg', NULL, '2025-12-08 01:26:58.92646+00', '2025-12-08 01:26:58.92646+00', '2025-12-08 01:26:58.92646+00', '{"eTag": "\"06d36f8e949fc021680b7b7159f015c7\"", "size": 145192, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-08T01:26:59.000Z", "contentLength": 145192, "httpStatusCode": 200}', 'ba02765e-46b8-4dc5-a884-60b8402965b6', NULL, '{}', 3),
	('93106fdf-8d40-4785-89d8-f73debd4db85', 'rich-text-images', '6d63d9e6-316c-4b29-bf6b-7ff03b623328/1765157310845.jpg', NULL, '2025-12-08 01:28:33.547775+00', '2025-12-08 01:28:33.547775+00', '2025-12-08 01:28:33.547775+00', '{"eTag": "\"56185f284e22cceb046d795c13ee3bea\"", "size": 283013, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-08T01:28:34.000Z", "contentLength": 283013, "httpStatusCode": 200}', 'ad4dd899-0ba2-4c54-abdc-44166da4e52c', NULL, '{}', 2),
	('847f2d8a-96ca-4c86-a88b-ec574e460255', 'news-images', 'province/7f4f6004-2124-47e0-931d-c40f7d71bea4/1765157486536.jpg', NULL, '2025-12-08 01:31:28.907864+00', '2025-12-08 01:31:28.907864+00', '2025-12-08 01:31:28.907864+00', '{"eTag": "\"06d36f8e949fc021680b7b7159f015c7\"", "size": 145192, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-08T01:31:29.000Z", "contentLength": 145192, "httpStatusCode": 200}', '831f947a-a7b3-41e4-8230-c260616506ca', NULL, '{}', 3),
	('650729eb-9c52-4c9d-ab73-25f59fd4c938', 'organization-logos', 'county/9cd224b7-76f6-4876-a58b-9188a3448133/1765163090908.png', NULL, '2025-12-08 03:04:51.748818+00', '2025-12-08 03:04:51.748818+00', '2025-12-08 03:04:51.748818+00', '{"eTag": "\"ef06d23bc376decbe7d3657a33e1b36e\"", "size": 568076, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-12-08T03:04:52.000Z", "contentLength": 568076, "httpStatusCode": 200}', '93215d62-4849-48d2-9098-cf4dce20c30d', NULL, '{}', 3),
	('9dec0fa1-3ba9-4416-9f86-17ee1d3a7435', 'organization-logos', 'county/a8dc9466-b1e5-45b5-954f-4544799db705/1765163921693.jpg', NULL, '2025-12-08 03:18:42.165372+00', '2025-12-08 03:18:42.165372+00', '2025-12-08 03:18:42.165372+00', '{"eTag": "\"497e888746f9afab9b507d63614f625b\"", "size": 66787, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-08T03:18:43.000Z", "contentLength": 66787, "httpStatusCode": 200}', '1105029e-404d-42e6-93b6-d290757c76b2', NULL, '{}', 3),
	('0fe007d1-3868-46a3-99eb-9ed3acfb7796', 'organization-logos', 'county/c07d1f0c-c34c-45b6-a2e0-21aaf23d91b1/1765164198694.jpeg', NULL, '2025-12-08 03:23:19.043051+00', '2025-12-08 03:23:19.043051+00', '2025-12-08 03:23:19.043051+00', '{"eTag": "\"70659f854bf4380b25a7621a6fd9868f\"", "size": 9095, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-08T03:23:19.000Z", "contentLength": 9095, "httpStatusCode": 200}', 'b1fd8bbd-aab6-419d-963f-b5d716cd8805', NULL, '{}', 3),
	('9560eb1f-c0f4-4e04-be4e-b2b999429371', 'organization-logos', 'team/e4f36777-7b8a-4682-8236-ddcb20f874c8/1765205546229.jpg', NULL, '2025-12-08 14:52:27.002006+00', '2025-12-08 14:52:27.002006+00', '2025-12-08 14:52:27.002006+00', '{"eTag": "\"fab69b201afe5eda72dbaeabd97e39bd\"", "size": 4430, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-08T14:52:27.000Z", "contentLength": 4430, "httpStatusCode": 200}', '896b3be7-f2e9-4818-9a1a-cb5cc5dead8a', NULL, '{}', 3),
	('1468012b-5708-4af4-8c3f-099cf2ea5790', 'organization-logos', 'team/e4f36777-7b8a-4682-8236-ddcb20f874c8/1765205858379.jpg', NULL, '2025-12-08 14:57:39.203937+00', '2025-12-08 14:57:39.203937+00', '2025-12-08 14:57:39.203937+00', '{"eTag": "\"fab69b201afe5eda72dbaeabd97e39bd\"", "size": 4430, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-08T14:57:40.000Z", "contentLength": 4430, "httpStatusCode": 200}', '415ae000-464b-491f-b6a2-d16da04ceae0', NULL, '{}', 3),
	('11fd4eb3-9ab1-4e14-b720-a4783c55cd27', 'organization-logos', 'team/e4f36777-7b8a-4682-8236-ddcb20f874c8/1765206157501.jpg', NULL, '2025-12-08 15:02:38.535774+00', '2025-12-08 15:02:38.535774+00', '2025-12-08 15:02:38.535774+00', '{"eTag": "\"fab69b201afe5eda72dbaeabd97e39bd\"", "size": 4430, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-08T15:02:39.000Z", "contentLength": 4430, "httpStatusCode": 200}', '97f095a9-c1c1-4856-b782-c6a75178ccd6', NULL, '{}', 3),
	('b263fd17-cf48-4550-ad84-f7edaf5ae0e8', 'organization-logos', 'group/ffa9761a-b44b-4c8f-9026-856fa1b7df88/1765208334135.png', NULL, '2025-12-08 15:38:55.931742+00', '2025-12-08 15:38:55.931742+00', '2025-12-08 15:38:55.931742+00', '{"eTag": "\"bf0bbecf4a55c3d52a83862458fdf22f\"", "size": 1138860, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-12-08T15:38:56.000Z", "contentLength": 1138860, "httpStatusCode": 200}', '6de91bd5-1a5d-4556-8f65-a98c21a0bfe6', NULL, '{}', 3),
	('9d943f72-9b5d-4e89-8c23-d52b815fcb34', 'knowledgebase-files', '12fa9b6e-4c8d-492f-858a-41e5207a56dd/ewa7pf.pdf', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', '2025-12-09 15:56:34.159243+00', '2025-12-09 15:56:34.159243+00', '2025-12-09 15:56:34.159243+00', '{"eTag": "\"5f663a87e6a66dd1429a6e17ddc834a3\"", "size": 501174, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-12-09T15:56:35.000Z", "contentLength": 501174, "httpStatusCode": 200}', '7640cc64-cb2f-41fc-8524-005caedbabe2', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', '{}', 2),
	('4c7ed026-c53b-4417-8acb-ccce6f0fdb5e', 'news-images', 'group/ffa9761a-b44b-4c8f-9026-856fa1b7df88/5cae403d-11f4-4cf6-b77a-bf0b0bcdf6f2/1765214690192.jpg', NULL, '2025-12-08 17:24:51.165402+00', '2025-12-08 17:24:51.165402+00', '2025-12-08 17:24:51.165402+00', '{"eTag": "\"4bf20f8d3a224aefbf9e30efdfddb7e3\"", "size": 495333, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-08T17:24:52.000Z", "contentLength": 495333, "httpStatusCode": 200}', 'f893aab0-5ae6-4dd1-bb40-c50f915d1080', NULL, '{}', 4),
	('bd0f6968-2e81-49fe-8105-024edf458145', 'organization-logos', 'team/fd76c3e4-f7ea-46d8-8bb3-8e889d5ef79e/1765278362670.jpg', NULL, '2025-12-09 11:06:03.656586+00', '2025-12-09 11:06:03.656586+00', '2025-12-09 11:06:03.656586+00', '{"eTag": "\"d72206e3beac45db7ff2f9bd52e813f8\"", "size": 7190, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-09T11:06:04.000Z", "contentLength": 7190, "httpStatusCode": 200}', '48d60754-21f1-4cc7-aa6d-2099696cbc4f', NULL, '{}', 3),
	('ff2792fa-3429-40dc-979b-20705e5cb394', 'knowledgebase-files', 'b107ebd8-a56f-439e-9834-1f8e92f1a97d/x7jpd.pdf', '30d04492-d7dc-4fe8-8686-96b21d006170', '2025-12-09 11:46:57.418978+00', '2025-12-09 11:46:57.418978+00', '2025-12-09 11:46:57.418978+00', '{"eTag": "\"3d59281efee5049eb22845d4551bad9b\"", "size": 580038, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-12-09T11:46:58.000Z", "contentLength": 580038, "httpStatusCode": 200}', 'f42cd26f-d527-42fd-bdb3-3d3f628b7d12', '30d04492-d7dc-4fe8-8686-96b21d006170', '{}', 2),
	('bc893407-ee8c-4c85-a1cd-9f223383fe70', 'knowledgebase-files', '25b2cf81-f673-4937-af5a-f55eb914e23c/ok9bvm.jpeg', '30d04492-d7dc-4fe8-8686-96b21d006170', '2025-12-09 12:35:55.280952+00', '2025-12-09 12:35:55.280952+00', '2025-12-09 12:35:55.280952+00', '{"eTag": "\"16e5ea57d4ffcd6062fffa14baa3f898\"", "size": 846596, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-09T12:35:56.000Z", "contentLength": 846596, "httpStatusCode": 200}', '7900b879-a8f5-40e2-91d0-643c0b3c3ae0', '30d04492-d7dc-4fe8-8686-96b21d006170', '{}', 2),
	('e0967687-4c57-4131-a033-b071f1e4f94d', 'knowledgebase-files', 'ef74258f-b3ad-452e-a86b-63ac52a812b6/mbckx.pdf', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', '2025-12-09 13:03:06.826452+00', '2025-12-09 13:03:06.826452+00', '2025-12-09 13:03:06.826452+00', '{"eTag": "\"b1ebd241afc438e238b11867a33815a4\"", "size": 1026273, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-12-09T13:03:07.000Z", "contentLength": 1026273, "httpStatusCode": 200}', '94e9dcd9-f040-42fc-a06f-8adc78ed5f36', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', '{}', 2),
	('de78b71e-8d23-4f09-9684-cea5128e8f66', 'news-images', 'sitewide/00000000-0000-0000-0000-000000000000/1765291461824.png', NULL, '2025-12-09 14:44:24.010661+00', '2025-12-09 14:44:24.010661+00', '2025-12-09 14:44:24.010661+00', '{"eTag": "\"5f6bef883d2532a7436f86e6233704cf\"", "size": 1820101, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-12-09T14:44:24.000Z", "contentLength": 1820101, "httpStatusCode": 200}', 'eefbb397-01e6-43c3-8a9e-600ac54f7419', NULL, '{}', 3),
	('b711af59-3832-40ff-b1a4-90a421f1253b', 'news-images', 'sitewide/00000000-0000-0000-0000-000000000000/74f76c44-bcf8-434d-a565-691ffcadbce4/1765291845195.png', NULL, '2025-12-09 14:50:47.929327+00', '2025-12-09 14:50:47.929327+00', '2025-12-09 14:50:47.929327+00', '{"eTag": "\"5f6bef883d2532a7436f86e6233704cf\"", "size": 1820101, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-12-09T14:50:48.000Z", "contentLength": 1820101, "httpStatusCode": 200}', 'a108fcd4-b9e8-4ea0-9099-f07e1986c27a', NULL, '{}', 4),
	('066be377-dee6-456b-a225-e651230518f7', 'knowledgebase-files', 'dbb6a181-67e6-4afd-9377-512b100e2190/2ud05x.pdf', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', '2025-12-09 15:45:38.603158+00', '2025-12-09 15:45:38.603158+00', '2025-12-09 15:45:38.603158+00', '{"eTag": "\"06e410c95e9863421903bca761669f93-2\"", "size": 8516679, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-12-09T15:45:39.000Z", "contentLength": 8516679, "httpStatusCode": 200}', '769f6304-02ad-4358-ade8-2cc2e08f7ace', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', '{}', 2),
	('8ba2addd-8ea9-4b40-b5c5-d9d846b6a883', 'knowledgebase-files', 'e363887b-4f52-4ecb-aa5b-7753641078b1/75sxj6.pdf', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', '2025-12-09 15:48:20.058258+00', '2025-12-09 15:48:20.058258+00', '2025-12-09 15:48:20.058258+00', '{"eTag": "\"543d0b5841185b6b91b08a45ce8b4c69\"", "size": 995991, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-12-09T15:48:20.000Z", "contentLength": 995991, "httpStatusCode": 200}', 'af047a28-1ae6-4f5f-88f9-bca9831c71d9', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', '{}', 2),
	('7515ddfd-862e-488c-8819-9fe75d569afb', 'knowledgebase-files', '80649b8b-b995-427b-b882-a7f9dbe00123/i6k4ns.pdf', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', '2025-12-09 15:58:16.547719+00', '2025-12-09 15:58:16.547719+00', '2025-12-09 15:58:16.547719+00', '{"eTag": "\"98b76f1c4d027bfa185794a4fd057a6f\"", "size": 526128, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-12-09T15:58:17.000Z", "contentLength": 526128, "httpStatusCode": 200}', '99974e7e-2bad-4c53-9664-127abe8fffe9', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', '{}', 2),
	('c8814a07-dfc0-42ff-add0-993348e7ef69', 'knowledgebase-files', 'fc166cc3-3d46-447c-8f18-93c671132c58/c5l0qd.pdf', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', '2025-12-09 16:00:26.962044+00', '2025-12-09 16:00:26.962044+00', '2025-12-09 16:00:26.962044+00', '{"eTag": "\"1ee8c5840a2060663788ac192a5f2d48\"", "size": 483660, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-12-09T16:00:27.000Z", "contentLength": 483660, "httpStatusCode": 200}', 'da09b122-48c4-4a26-8be5-0463cde35b21', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', '{}', 2),
	('b9cedfe3-c6a9-41b2-93b4-b73b560ac83d', 'news-images', 'sitewide/00000000-0000-0000-0000-000000000000/80649b8b-b995-427b-b882-a7f9dbe00123/1765297288426.jpg', NULL, '2025-12-09 16:21:30.086188+00', '2025-12-09 16:21:30.086188+00', '2025-12-09 16:21:30.086188+00', '{"eTag": "\"0f74ff527d76c4ccfe2e16ca977c264f\"", "size": 166530, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-09T16:21:31.000Z", "contentLength": 166530, "httpStatusCode": 200}', 'df8552b9-a811-4d44-b026-87a2dae06b87', NULL, '{}', 4);


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."prefixes" ("bucket_id", "name", "created_at", "updated_at") VALUES
	('organization-logos', 'province', '2025-12-04 23:33:06.527664+00', '2025-12-04 23:33:06.527664+00'),
	('organization-logos', 'province/7f4f6004-2124-47e0-931d-c40f7d71bea4', '2025-12-04 23:33:06.527664+00', '2025-12-04 23:33:06.527664+00'),
	('organization-logos', 'county', '2025-12-04 23:42:49.183476+00', '2025-12-04 23:42:49.183476+00'),
	('organization-logos', 'county/09c9f169-af0a-4ef4-be06-82719ef4da55', '2025-12-04 23:42:49.183476+00', '2025-12-04 23:42:49.183476+00'),
	('organization-logos', 'province/babdf52c-ffbe-4077-b8f8-eda6c942e1ff', '2025-12-04 23:46:55.108165+00', '2025-12-04 23:46:55.108165+00'),
	('news-images', 'province', '2025-12-05 00:14:40.046856+00', '2025-12-05 00:14:40.046856+00'),
	('news-images', 'province/7f4f6004-2124-47e0-931d-c40f7d71bea4', '2025-12-05 00:14:40.046856+00', '2025-12-05 00:14:40.046856+00'),
	('news-images', 'province/7f4f6004-2124-47e0-931d-c40f7d71bea4/9cfde7ad-57c3-4cbf-9453-b171313038c4', '2025-12-05 00:14:40.046856+00', '2025-12-05 00:14:40.046856+00'),
	('rich-text-images', '5ba4f970-d952-4b4e-9470-c021e3efd767', '2025-12-05 00:31:25.761627+00', '2025-12-05 00:31:25.761627+00'),
	('knowledgebase-files', '80382881-28f9-4d6d-8a92-fbe0add549f1', '2025-12-05 22:11:35.990641+00', '2025-12-05 22:11:35.990641+00'),
	('rich-text-images', '6d63d9e6-316c-4b29-bf6b-7ff03b623328', '2025-12-08 01:28:17.539216+00', '2025-12-08 01:28:17.539216+00'),
	('organization-logos', 'county/9cd224b7-76f6-4876-a58b-9188a3448133', '2025-12-08 03:04:51.748818+00', '2025-12-08 03:04:51.748818+00'),
	('organization-logos', 'county/a8dc9466-b1e5-45b5-954f-4544799db705', '2025-12-08 03:18:42.165372+00', '2025-12-08 03:18:42.165372+00'),
	('organization-logos', 'county/c07d1f0c-c34c-45b6-a2e0-21aaf23d91b1', '2025-12-08 03:23:19.043051+00', '2025-12-08 03:23:19.043051+00'),
	('organization-logos', 'team', '2025-12-08 14:52:27.002006+00', '2025-12-08 14:52:27.002006+00'),
	('organization-logos', 'team/e4f36777-7b8a-4682-8236-ddcb20f874c8', '2025-12-08 14:52:27.002006+00', '2025-12-08 14:52:27.002006+00'),
	('organization-logos', 'group', '2025-12-08 15:38:55.931742+00', '2025-12-08 15:38:55.931742+00'),
	('organization-logos', 'group/ffa9761a-b44b-4c8f-9026-856fa1b7df88', '2025-12-08 15:38:55.931742+00', '2025-12-08 15:38:55.931742+00'),
	('news-images', 'group', '2025-12-08 17:24:51.165402+00', '2025-12-08 17:24:51.165402+00'),
	('news-images', 'group/ffa9761a-b44b-4c8f-9026-856fa1b7df88', '2025-12-08 17:24:51.165402+00', '2025-12-08 17:24:51.165402+00'),
	('news-images', 'group/ffa9761a-b44b-4c8f-9026-856fa1b7df88/5cae403d-11f4-4cf6-b77a-bf0b0bcdf6f2', '2025-12-08 17:24:51.165402+00', '2025-12-08 17:24:51.165402+00'),
	('organization-logos', 'team/fd76c3e4-f7ea-46d8-8bb3-8e889d5ef79e', '2025-12-09 11:06:03.656586+00', '2025-12-09 11:06:03.656586+00'),
	('knowledgebase-files', 'b107ebd8-a56f-439e-9834-1f8e92f1a97d', '2025-12-09 11:46:57.418978+00', '2025-12-09 11:46:57.418978+00'),
	('knowledgebase-files', '25b2cf81-f673-4937-af5a-f55eb914e23c', '2025-12-09 12:35:55.280952+00', '2025-12-09 12:35:55.280952+00'),
	('knowledgebase-files', 'ef74258f-b3ad-452e-a86b-63ac52a812b6', '2025-12-09 13:03:06.826452+00', '2025-12-09 13:03:06.826452+00'),
	('news-images', 'sitewide', '2025-12-09 14:44:24.010661+00', '2025-12-09 14:44:24.010661+00'),
	('news-images', 'sitewide/00000000-0000-0000-0000-000000000000', '2025-12-09 14:44:24.010661+00', '2025-12-09 14:44:24.010661+00'),
	('news-images', 'sitewide/00000000-0000-0000-0000-000000000000/74f76c44-bcf8-434d-a565-691ffcadbce4', '2025-12-09 14:50:47.929327+00', '2025-12-09 14:50:47.929327+00'),
	('knowledgebase-files', 'dbb6a181-67e6-4afd-9377-512b100e2190', '2025-12-09 15:45:38.603158+00', '2025-12-09 15:45:38.603158+00'),
	('knowledgebase-files', 'e363887b-4f52-4ecb-aa5b-7753641078b1', '2025-12-09 15:48:20.058258+00', '2025-12-09 15:48:20.058258+00'),
	('knowledgebase-files', '12fa9b6e-4c8d-492f-858a-41e5207a56dd', '2025-12-09 15:56:34.159243+00', '2025-12-09 15:56:34.159243+00'),
	('knowledgebase-files', '80649b8b-b995-427b-b882-a7f9dbe00123', '2025-12-09 15:58:16.547719+00', '2025-12-09 15:58:16.547719+00'),
	('knowledgebase-files', 'fc166cc3-3d46-447c-8f18-93c671132c58', '2025-12-09 16:00:26.962044+00', '2025-12-09 16:00:26.962044+00'),
	('news-images', 'sitewide/00000000-0000-0000-0000-000000000000/80649b8b-b995-427b-b882-a7f9dbe00123', '2025-12-09 16:21:30.086188+00', '2025-12-09 16:21:30.086188+00');


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 88, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict iy140hAMm2gFOspuvFdCi9cEz1hbrxLRATTwGoHe6KZdCq0bCF3hHdSE1Dr4emT

RESET ALL;
