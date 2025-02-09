PGDMP                      |            chat    16.3    16.3     �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    16413    chat    DATABASE        CREATE DATABASE chat WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';
    DROP DATABASE chat;
                postgres    false            �            1259    16427    messages    TABLE        CREATE TABLE public.messages (
    id integer NOT NULL,
    message text NOT NULL,
    sender integer,
    receiver integer
);
    DROP TABLE public.messages;
       public         heap    postgres    false            �            1259    16426    messages_id_seq    SEQUENCE     �   CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.messages_id_seq;
       public          postgres    false    218            �           0    0    messages_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;
          public          postgres    false    217            �            1259    16415    users    TABLE     �   CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    isactive boolean DEFAULT false
);
    DROP TABLE public.users;
       public         heap    postgres    false            �            1259    16414    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public          postgres    false    216            �           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public          postgres    false    215            !           2604    16430    messages id    DEFAULT     j   ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);
 :   ALTER TABLE public.messages ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    218    217    218                       2604    16418    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    216    215    216            �          0    16427    messages 
   TABLE DATA           A   COPY public.messages (id, message, sender, receiver) FROM stdin;
    public          postgres    false    218   �       �          0    16415    users 
   TABLE DATA           A   COPY public.users (id, username, password, isactive) FROM stdin;
    public          postgres    false    216   ~       �           0    0    messages_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.messages_id_seq', 17, true);
          public          postgres    false    217            �           0    0    users_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.users_id_seq', 4, true);
          public          postgres    false    215            '           2606    16434    messages messages_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.messages DROP CONSTRAINT messages_pkey;
       public            postgres    false    218            #           2606    16423    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public            postgres    false    216            %           2606    16425    users users_username_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);
 B   ALTER TABLE ONLY public.users DROP CONSTRAINT users_username_key;
       public            postgres    false    216            (           2606    16440    messages messages_receiver_fkey    FK CONSTRAINT        ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_receiver_fkey FOREIGN KEY (receiver) REFERENCES public.users(id);
 I   ALTER TABLE ONLY public.messages DROP CONSTRAINT messages_receiver_fkey;
       public          postgres    false    4643    216    218            )           2606    16435    messages messages_sender_fkey    FK CONSTRAINT     {   ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_fkey FOREIGN KEY (sender) REFERENCES public.users(id);
 G   ALTER TABLE ONLY public.messages DROP CONSTRAINT messages_sender_fkey;
       public          postgres    false    4643    216    218            �   y   x�E���@D��c2��kÆ�,�����ݘ��.C�D�C	zAK�D*��9>gj�#TMZ�s�	!{�6���V�?v0g�M�����r ��{�o�O���|�s���7���/�      �   B   x�3�LJ-��415�L�2�,��,�4��rL8S�J��8��9K�A�����NC#c�@� ���     