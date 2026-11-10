// The university sample database used across all 8 lectures.
// Names follow Lectures 3-8 (Tinsae, Yohannes, Biniam, ...).
// Lectures 1-2 use the same IDs with international names — noted in the app.

export const SEED_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE department (
  dept_name TEXT PRIMARY KEY,
  building  TEXT NOT NULL,
  budget    NUMERIC(12,2) CHECK (budget >= 0)
);

CREATE TABLE instructor (
  ID        TEXT PRIMARY KEY,
  name      TEXT NOT NULL,
  dept_name TEXT NOT NULL REFERENCES department(dept_name),
  salary    NUMERIC(8,2) CHECK (salary >= 0)
);

CREATE TABLE course (
  course_id TEXT PRIMARY KEY,
  title     TEXT NOT NULL,
  credits   INTEGER CHECK (credits > 0),
  dept_name TEXT REFERENCES department(dept_name)
);

CREATE TABLE prereq (
  course_id TEXT REFERENCES course(course_id),
  prereq_id TEXT REFERENCES course(course_id),
  PRIMARY KEY (course_id, prereq_id)
);

CREATE TABLE section (
  course_id   TEXT REFERENCES course(course_id),
  sec_id      TEXT NOT NULL,
  semester    TEXT NOT NULL CHECK (semester IN ('Fall','Winter','Spring','Summer')),
  year        INTEGER NOT NULL CHECK (year > 1000),
  building    TEXT,
  room_number TEXT,
  PRIMARY KEY (course_id, sec_id, semester, year)
);

CREATE TABLE teaches (
  ID        TEXT NOT NULL REFERENCES instructor(ID),
  course_id TEXT NOT NULL,
  sec_id    TEXT NOT NULL,
  semester  TEXT NOT NULL,
  year      INTEGER NOT NULL,
  PRIMARY KEY (ID, course_id, sec_id, semester, year),
  FOREIGN KEY (course_id, sec_id, semester, year)
    REFERENCES section(course_id, sec_id, semester, year)
);

INSERT INTO department VALUES
  ('Biology',   'Watson',  90000),
  ('Comp. Sci.','Taylor',  100000),
  ('Elec. Eng.','Taylor',  85000),
  ('Finance',   'Painter', 120000),
  ('History',   'Painter', 50000),
  ('Music',     'Packard', 80000),
  ('Physics',   'Watson',  70000);

INSERT INTO instructor VALUES
  ('10101','Tinsae',    'Comp. Sci.', 65000),
  ('12121','Yohannes',  'Finance',    90000),
  ('15151','Kidist',    'Music',      40000),
  ('22222','Biniam',    'Physics',    95000),
  ('32343','Eden',      'History',    60000),
  ('33456','Fikru',     'Physics',    87000),
  ('45565','Getachew',  'Comp. Sci.', 75000),
  ('58583','Amare',     'History',    62000),
  ('76543','Mintesinot','Finance',    80000),
  ('76766','Betelhem',  'Biology',    72000),
  ('83821','Almaz',     'Comp. Sci.', 92000),
  ('98345','Hirut',     'Elec. Eng.', 80000);

INSERT INTO course VALUES
  ('BIO-101','Intro. to Biology',        4, 'Biology'),
  ('BIO-301','Genetics',                 4, 'Biology'),
  ('BIO-399','Computational Biology',    3, 'Biology'),
  ('CS-101', 'Intro. to Computer Science',4,'Comp. Sci.'),
  ('CS-190', 'Game Design',              4, 'Comp. Sci.'),
  ('CS-315', 'Robotics',                 3, 'Comp. Sci.'),
  ('CS-319', 'Image Processing',         4, 'Comp. Sci.'),
  ('CS-347', 'Database Systems',         3, 'Comp. Sci.'),
  ('EE-181', 'Intro. to Digital Systems',3, 'Elec. Eng.'),
  ('FIN-201','Investment Banking',       3, 'Finance'),
  ('HIS-351','World History',            3, 'History'),
  ('MU-199', 'Music Video Production',   3, 'Music'),
  ('PHY-101','Physical Principles',      4, 'Physics');

INSERT INTO prereq VALUES
  ('BIO-301','BIO-101'),
  ('BIO-399','BIO-101'),
  ('CS-190', 'CS-101'),
  ('CS-315', 'CS-101'),
  ('CS-319', 'CS-101'),
  ('CS-347', 'CS-101'),
  ('EE-181', 'PHY-101');

INSERT INTO section VALUES
  ('BIO-101','1','Summer',2017,'Watson','17'),
  ('BIO-301','1','Summer',2018,'Watson','12'),
  ('CS-101', '1','Fall',  2017,'Packard','101'),
  ('CS-101', '1','Spring',2018,'Packard','101'),
  ('CS-190', '1','Spring',2017,'Taylor','3'),
  ('CS-190', '2','Spring',2017,'Taylor','12'),
  ('CS-315', '1','Spring',2018,'Watson','120'),
  ('CS-319', '1','Spring',2018,'Watson','100'),
  ('CS-319', '2','Spring',2018,'Taylor','12'),
  ('CS-347', '1','Fall',  2017,'Taylor','5'),
  ('EE-181', '1','Spring',2017,'Taylor','3'),
  ('FIN-201','1','Spring',2018,'Packard','101'),
  ('HIS-351','1','Spring',2018,'Painter','5'),
  ('MU-199', '1','Spring',2018,'Music','100'),
  ('PHY-101','1','Fall',  2017,'Watson','100');

INSERT INTO teaches VALUES
  ('10101','CS-101', '1','Fall',  2017),
  ('10101','CS-315', '1','Spring',2018),
  ('10101','CS-347', '1','Fall',  2017),
  ('12121','FIN-201','1','Spring',2018),
  ('15151','MU-199', '1','Spring',2018),
  ('22222','PHY-101','1','Fall',  2017),
  ('32343','HIS-351','1','Spring',2018),
  ('45565','CS-101', '1','Spring',2018),
  ('45565','CS-319', '1','Spring',2018),
  ('76766','BIO-101','1','Summer',2017),
  ('76766','BIO-301','1','Summer',2018),
  ('83821','CS-190', '1','Spring',2017),
  ('83821','CS-190', '2','Spring',2017),
  ('83821','CS-319', '2','Spring',2018),
  ('98345','EE-181', '1','Spring',2017);

-- practice tables used by the lab examples in the lectures
CREATE TABLE lab_prereq (
  course_id TEXT NOT NULL,
  prereq_id TEXT NOT NULL,
  PRIMARY KEY (course_id, prereq_id)
);
INSERT INTO lab_prereq VALUES
  ('CS-347','CS-315'), ('CS-347','CS-319'),
  ('CS-315','CS-101'), ('CS-319','CS-101');

CREATE TABLE lab_account (name TEXT PRIMARY KEY, balance NUMERIC(12,2) CHECK (balance >= 0));
INSERT INTO lab_account VALUES ('Biniam', 600), ('Fikru', 400);

CREATE TABLE lab_parent (ID INTEGER PRIMARY KEY, project TEXT NOT NULL);
INSERT INTO lab_parent VALUES (1, 'Vision'), (2, 'Language');

CREATE TABLE lab_child (
  ID INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id INTEGER NOT NULL REFERENCES lab_parent(ID)
    ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO lab_child VALUES (11,'Biniam',1), (12,'Fikru',1), (13,'Tinsae',2);

CREATE TABLE lab_faculty (ID TEXT PRIMARY KEY, name TEXT NOT NULL, salary NUMERIC(9,2));
INSERT INTO lab_faculty VALUES ('22222','Biniam',95000), ('33456','Fikru',87000);

CREATE TABLE lab_salary_log (ID TEXT, old_salary NUMERIC(9,2), new_salary NUMERIC(9,2));

CREATE TRIGGER log_salary
AFTER UPDATE OF salary ON lab_faculty
FOR EACH ROW
WHEN OLD.salary IS NOT NEW.salary
BEGIN
  INSERT INTO lab_salary_log VALUES (NEW.ID, OLD.salary, NEW.salary);
END;

CREATE TABLE lab_offer (ID TEXT);
INSERT INTO lab_offer VALUES ('10101'), (NULL);

CREATE TABLE lab_event (ID INTEGER PRIMARY KEY, status TEXT DEFAULT 'draft');

CREATE TABLE lab_instructor (
  ID TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  dept_name TEXT NOT NULL,
  salary INTEGER CHECK (salary >= 0),
  email TEXT UNIQUE,
  FOREIGN KEY (dept_name) REFERENCES department(dept_name)
);
`;

// Reset statements that restore the mutable lab tables to their lecture state.
export const LAB_RESET_SQL = `
DELETE FROM lab_account;
INSERT INTO lab_account VALUES ('Biniam', 600), ('Fikru', 400);
DELETE FROM lab_child;
INSERT INTO lab_child VALUES (11,'Biniam',1), (12,'Fikru',1), (13,'Tinsae',2);
DELETE FROM lab_parent;
INSERT INTO lab_parent VALUES (1, 'Vision'), (2, 'Language');
DELETE FROM lab_salary_log;
UPDATE lab_faculty SET salary = 95000 WHERE ID = '22222';
UPDATE lab_faculty SET salary = 87000 WHERE ID = '33456';
DELETE FROM lab_event;
DELETE FROM lab_instructor;
`;
