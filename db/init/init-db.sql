--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13
-- Dumped by pg_dump version 15.13

-- Started on 2025-07-02 15:46:51

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 16416)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 3374 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 16485)
-- Name: likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.likes (
    username character varying NOT NULL,
    post_id uuid NOT NULL,
    liked_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.likes OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16462)
-- Name: posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.posts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    author character varying(100) NOT NULL,
    comments_count integer DEFAULT 0,
    text text NOT NULL,
    created_date timestamp with time zone DEFAULT now(),
    last_modified_date timestamp with time zone DEFAULT now(),
    title text NOT NULL,
    tags character varying(500),
    tags_count integer DEFAULT 0
);


ALTER TABLE public.posts OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 16437)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 16436)
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.roles_id_seq OWNER TO postgres;

--
-- TOC entry 3375 (class 0 OID 0)
-- Dependencies: 215
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 217 (class 1259 OID 16445)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    created_date timestamp with time zone DEFAULT now(),
    last_modified_date timestamp with time zone DEFAULT now(),
    date_of_birth date,
    city character varying(100),
    state character varying(100),
    preferred_language character varying(10),
    role_id integer,
    username character varying(100) NOT NULL,
    password_hash character varying(100) NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 3196 (class 2604 OID 16440)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 3368 (class 0 OID 16485)
-- Dependencies: 219
-- Data for Name: likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.likes (username, post_id, liked_at) FROM stdin;
pera	4fd5ab6c-b19a-4e27-8e2b-b4dd1b7c2d18	2025-07-02 10:47:34.261337+02
pera	0a5bdbe1-525a-4125-a5f7-306ee432beb6	2025-07-02 12:47:52.172377+02
pera	813a98dd-bb5f-4fea-a1c0-472368fa9874	2025-07-02 12:48:02.011686+02
mika	0a5bdbe1-525a-4125-a5f7-306ee432beb6	2025-07-02 15:09:07.239965+02
biki	4fd5ab6c-b19a-4e27-8e2b-b4dd1b7c2d18	2025-07-02 15:15:29.892568+02
\.


--
-- TOC entry 3367 (class 0 OID 16462)
-- Dependencies: 218
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.posts (id, author, comments_count, text, created_date, last_modified_date, title, tags, tags_count) FROM stdin;
813a98dd-bb5f-4fea-a1c0-472368fa9874	admin	0	Lorem ipsum dolor sit amet	2025-06-26 12:00:37.036227+02	2025-06-26 12:00:37.036227+02	TEST 1	tag1;tag2	2
0a5bdbe1-525a-4125-a5f7-306ee432beb6	admin	\N	Mediteranska ishrana je mnogo jaka ishrana, covek se samo salatira jede grcku fetu, grcki jogurt, jaka salatiranja sa maslinova ulja.\nOnda girosi neizostavan deo. Riba se dosta fura dole na Mediteran i onda su oni zdravi vitki super.	2025-06-29 17:40:58.477948+02	2025-06-29 17:40:58.477948+02	Mediteranska Ishrana	ishrana	\N
9eed1830-f2b4-4d76-b794-2b444f904246	pera	\N	Toni montana je najjaci lik na TikTok slash Instagram. To je jedan debeo ali srecan covek koji je shvatio da u zivotu nije bogat onaj koji ima nego onaj kome malo treba. A toni je jedan od njih. Zivi u skromnoj kuci na selu svojih roditelja. Vratio se iz Svajcarske, kanton Ticino najjaci kanton u Svicu. Ziveo je i tamo lepo ali Toni je osecao neku prazninu, proziveo je mnogo toga u toj Divnoj zemlji. Bio je sa puno dama i upoznao najvece face italianskog dzet seta. Druzio se sa njima i u provodu kroz mokracu i stolicu je kroz njega proslo barem 1 Milion evra. Resio je da se smiri i zato se vratio u svoj kraj da vodi miran i jednostavan zivot. Tu je njegov verni pas zvani Kuci. Kuci je isto debeljuskasto kucence, kao i njegov gazda jer se stalno ufuljuje s neku hranu. Gazda dobro i obilato jede, pa je normalno da je  i kuci takav. Kuci je ponekad bujan i besan, a to je zbog toga sto ga Toni Montana stalno zajebava i provocira. Kuciju je pre neki dan puko film, nije mogo vise da gleda kako ga debeli gmaz podjebava i uapao je svoga gazdu. \nAntonio je veliki ljubitelj zivotinja. Pored Kucija, cuva i zeceve. Ispred njega u tanjiru su se nasle mnogobrojne vrste zivotinja. Nema sta nije probao, cak je jeo i meso od goluba. Zecetina je, pogadjate, njegova rutina, nista neobicno.	2025-06-29 17:59:10.567529+02	2025-06-29 17:59:10.567529+02	Toni Montana	Gredetin;Aleksinac;TikTok;Fanovi;Instagram;Antonio Montana	\N
4fd5ab6c-b19a-4e27-8e2b-b4dd1b7c2d18	mika	\N	Na pocetku vam ove dve reci iz naslova ne znace puno, Dragi Crni. Kao da je neko zaboravio da navede imenicu i naveo samo dva prideva u muskom rodu jedan za drugim. Medjutim, ako ste skoro skrolali po instagramu i tiktoku, onda znate ko je ovaj gospodin. Deda Dragi je zapravo stanovnik jednog sela pokraj Leskovca, pripanik one stare garde, covek starog kova i jos starijih uverenja. Vredan, naviko na rad jos od svojih malih nogu. Deda Dragi nije samo deda zbog toga sto je mator, a sigurno ima 75 godina. Vec je i deda jer ima unuke. Dva unuka koje ima su od njegovog sina, koga zovu Kobac. \nNjegovi unuci su otkrili dedinu najvecu tajnu - tanke zivce. Deda dragi ima veoma kratak fitilj i dovoljna je mala iskra da sve plane i da Dragi poludi. To su dobro znali njegovi rodjaci koji preko cele godine borave kod njega i podjebavaju ga. Najbolji i najviralniji klip je bio onaj kada je unuk samo malo mrdnuo kanister sa benzinom dok je deda Dragi sipao benzin u svoj Traktor. To je momentalno izbacilo Dragija iz takta jer je on covek navikao da nema i da stedi, a benzin je veoma skupa roba i na selu se nista na baca. Odmah je zasuo svog unuka grdnjama i psovkama. "I sta ti sad to znaci?", upitao je Dragi, pa nastavi jos jacim tonom: "Pitam te sta ti znaci????". "PITAM TE" ? Drao se deda Dragi. Jer Dragi je znao - nafta i benzin su dve mnogo dragocene stvari da bi se sa njima tek tako rasipalo. \nU slobodno vreme Dragi voli da pije rakiju i da odmara, s obzirom da je penzos.	2025-06-29 18:12:03.734749+02	2025-06-29 18:12:03.734749+02	Dragi Crni	Leskovac;Dragi;Selo;KratakFitilj	\N
695914fd-30a7-4ff0-b1a3-df5644674ce3	pera	0	Da li vam ovaj naslov vec golica mastu ? Da li zamisljate Antonia ? Kako izgleda taj prefienjeni gospodin sa manirima sa zapada ? \nMislim da treba vec da povezete, covek koji se preziva montana mora biti krupan - jer je "montanja" na Italianskom planina. Znaci covek je planina. \nEto odao sam vam jedan detalj. I da, covek je gurman i voli da uziva u hrani. Tako da, mozete da pretpostavite da Antonio ima svoju planinu - ispod grudi. Tako je! \nAntonio kada kuva, to dimi kao na Marakani u sao paolo. To sve prsti od jaki potezi, uvezbani i zategnuti. On kad kuva u letnjem periodu, obavezno nosi samo gace, jer kaze zle sile beze od dobrog coveka u gacama sa planinom ispod bedara. A ispod velike planine uvek raste dobar kukuruz ;).	2025-07-01 10:55:00.785131+02	2025-07-01 10:55:00.785131+02	Paklena kuhinja Antonia Montane	kuhinja;Antonio;Montana;Planina;Zdravlje	5
\.


--
-- TOC entry 3365 (class 0 OID 16437)
-- Dependencies: 216
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name) FROM stdin;
1	ROLE_ADMIN
2	ROLE_USER
\.


--
-- TOC entry 3366 (class 0 OID 16445)
-- Dependencies: 217
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, first_name, last_name, created_date, last_modified_date, date_of_birth, city, state, preferred_language, role_id, username, password_hash) FROM stdin;
e4d37a48-7d3d-4c35-a83a-ab87b33c49f6	\N	\N	2025-06-15 22:19:08.95792+02	2025-06-15 22:19:08.95792+02	\N	\N	\N	\N	1	admin	$2b$10$SL/x3uyVzbHM8zS1TciCTehJEHHeeUEe3qeZgGO.NH1YIE3fC09Na
339b797d-dc64-4c94-8a3a-c908411dfc2d	\N	\N	2025-06-15 22:19:08.95792+02	2025-06-15 22:19:08.95792+02	\N	\N	\N	\N	2	user	$2b$10$b4GheSckegCZvGjdp6M1kuiLem0UrScM17Jdyy53zulZj1KEYG5nm
99afcfbe-de7f-4c0e-ab06-93a90bd48406	Petar	Petrovic	2025-06-27 11:40:38.79413+02	2025-06-27 11:40:38.79413+02	2025-06-30	Belgrade	Serbia	en	2	pera	$2b$10$S6UTiUmM9KwaF3RVrAbicO8SFNK.dxbuVWUS1XNRtFEz72DvKdi22
2b84927f-b011-4c37-a85a-ae779aa237f7	Milorad	Mikic	2025-06-27 11:41:39.545735+02	2025-06-27 11:41:39.545735+02	1997-04-23	Belgrade	Serbia	en	2	mika	$2b$10$OjiM8I8cLjxTA.0O/OfoJed/2i/D4gwkCNU404.kv2e4nvF0OUHKa
8a499575-019c-4395-bb18-f191c2229ce4	Bilja	Prodanović	2025-07-02 15:14:57.674481+02	2025-07-02 15:14:57.674481+02	1982-11-25	Belgrade	Serbia	en	2	biki	$2b$10$OcRUW4yu12lYmSLTZjxjiOaIe5qQ47bRrsy3maO8w0admFzfaI7iC
\.


--
-- TOC entry 3376 (class 0 OID 0)
-- Dependencies: 215
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 2, true);


--
-- TOC entry 3217 (class 2606 OID 16492)
-- Name: likes likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (username, post_id);


--
-- TOC entry 3215 (class 2606 OID 16474)
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- TOC entry 3207 (class 2606 OID 16444)
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- TOC entry 3209 (class 2606 OID 16442)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 3211 (class 2606 OID 16452)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3213 (class 2606 OID 16459)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 3219 (class 2606 OID 16480)
-- Name: posts fk_author_username; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT fk_author_username FOREIGN KEY (author) REFERENCES public.users(username) ON DELETE CASCADE;


--
-- TOC entry 3220 (class 2606 OID 16498)
-- Name: likes likes_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- TOC entry 3221 (class 2606 OID 16493)
-- Name: likes likes_username_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_username_fkey FOREIGN KEY (username) REFERENCES public.users(username) ON DELETE CASCADE;


--
-- TOC entry 3218 (class 2606 OID 16453)
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


-- Completed on 2025-07-02 15:46:52

--
-- PostgreSQL database dump complete
--

