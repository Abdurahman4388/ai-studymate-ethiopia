"""Curated National Exit Exam Question Banks for Ethiopian Universities.

Aligned with the official Ministry of Education (MoE) Computer Science and Software Engineering Exit Exam Blueprints.
"""

from typing import List, Dict, Any

EXIT_EXAM_BANKS: Dict[str, List[Dict[str, Any]]] = {
    # 1. CORE DATA STRUCTURES & ALGORITHMS
    "dsa": [
        {
            "question": "Which data structure is primarily used to implement Breadth-First Search (BFS) in a graph traversal?",
            "options": ["Stack", "Queue", "Priority Queue", "Binary Search Tree"],
            "correct_index": 1,
            "explanation": "BFS explores vertices level-by-level using a FIFO (First-In, First-Out) Queue data structure.",
            "source_citation": "MoE CS Blueprint: Data Structures & Algorithms",
        },
        {
            "question": "What is the worst-case time complexity of finding an element in a Hash Table with open addressing if a poor hash function creates high clustering?",
            "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
            "correct_index": 2,
            "explanation": "While average case search in a hash table is O(1), worst-case search when all keys collide into the same bucket/cluster degrades to linear time O(n).",
            "source_citation": "MoE CS Blueprint: Data Structures & Algorithms",
        },
        {
            "question": "Which sorting algorithm is guaranteed to have an asymptotic time complexity of O(n log n) even in its worst-case scenario?",
            "options": ["QuickSort", "MergeSort", "BubbleSort", "InsertionSort"],
            "correct_index": 1,
            "explanation": "MergeSort divides the array recursively and merges in linear time, guaranteeing O(n log n) in best, average, and worst cases (unlike QuickSort which can degrade to O(n²)).",
            "source_citation": "MoE CS Blueprint: Design & Analysis of Algorithms",
        },
        {
            "question": "In a Self-Balancing Binary Search Tree (AVL Tree), what is the maximum allowed difference between the heights of the left and right subtrees for any node?",
            "options": ["0", "1", "2", "log n"],
            "correct_index": 1,
            "explanation": "The AVL balance factor is defined as Balance = Height(Left) - Height(Right), and must strictly remain in {-1, 0, +1}.",
            "source_citation": "MoE CS Blueprint: Advanced Data Structures",
        },
        {
            "question": "Dijkstra's Single-Source Shortest Path algorithm fails or produces incorrect shortest paths when applied to graphs that contain:",
            "options": ["Cycles", "Directed edges", "Negative edge weights", "Disconnected components"],
            "correct_index": 2,
            "explanation": "Dijkstra's greedy choice assumes adding an edge only increases path cost. Negative weights violate this assumption; Bellman-Ford algorithm must be used instead.",
            "source_citation": "MoE CS Blueprint: Algorithms",
        },
    ],

    # 2. DATABASE SYSTEMS
    "database_systems": [
        {
            "question": "In relational database design, what does the Third Normal Form (3NF) strictly eliminate?",
            "options": [
                "Repeating groups and multi-valued attributes",
                "Partial functional dependencies on a composite key",
                "Transitive dependencies of non-key attributes on the primary key",
                "Join dependencies",
            ],
            "correct_index": 2,
            "explanation": "1NF eliminates repeating groups, 2NF eliminates partial dependencies, and 3NF eliminates transitive dependencies (where X -> Y and Y -> Z).",
            "source_citation": "MoE CS Blueprint: Database Management Systems",
        },
        {
            "question": "Which property of database transactions (ACID) ensures that either all operations of a transaction are executed successfully or none of them are reflected in the database?",
            "options": ["Atomicity", "Consistency", "Isolation", "Durability"],
            "correct_index": 0,
            "explanation": "Atomicity follows the 'all-or-nothing' rule: if any statement in a transaction fails, the entire transaction is rolled back.",
            "source_citation": "MoE CS Blueprint: Database Systems (Transaction Management)",
        },
        {
            "question": "What is the primary advantage of a B+ Tree index over a standard Binary Search Tree for relational database disk storage?",
            "options": [
                "B+ Trees have fewer nodes than binary trees",
                "B+ Trees have high fan-out, reducing the number of disk I/O operations needed to locate records",
                "B+ Trees do not require disk space for pointers",
                "B+ Trees can only store integer keys",
            ],
            "correct_index": 1,
            "explanation": "B+ Trees have a high branching factor (fan-out) that matches disk block page sizes, keeping tree height low and minimizing slow disk seeks.",
            "source_citation": "MoE CS Blueprint: Database Implementation & Indexing",
        },
        {
            "question": "Which SQL statement is used to remove a table's structure along with all its data and indexes from the database schema?",
            "options": ["DELETE TABLE", "TRUNCATE TABLE", "DROP TABLE", "REMOVE TABLE"],
            "correct_index": 2,
            "explanation": "DROP TABLE deletes the schema definition and data. (TRUNCATE only empties the rows while preserving the schema).",
            "source_citation": "MoE CS Blueprint: SQL & Relational Models",
        },
    ],

    # 3. SOFTWARE ENGINEERING & DESIGN PATTERNS
    "software_engineering": [
        {
            "question": "Which Software Engineering design pattern ensures a class has only one instance and provides a global point of access to it?",
            "options": ["Factory Method", "Observer", "Singleton", "Adapter"],
            "correct_index": 2,
            "explanation": "The Singleton pattern restricts instantiation of a class to a single object, common in database connection pools or loggers.",
            "source_citation": "MoE CS Blueprint: Software Engineering",
        },
        {
            "question": "In Object-Oriented Software Design, what does the 'O' in the SOLID principles stand for?",
            "options": [
                "Object-Oriented Principle",
                "Open/Closed Principle (Open for extension, closed for modification)",
                "One-Responsibility Principle",
                "Operational Decoupling Principle",
            ],
            "correct_index": 1,
            "explanation": "The Open/Closed Principle states that software entities (classes, modules) should be open for extension without modifying existing source code.",
            "source_citation": "MoE CS Blueprint: Object-Oriented Software Engineering",
        },
        {
            "question": "Which Agile development artifact represents a prioritized list of user features, bug fixes, and technical requirements maintained by the Product Owner?",
            "options": ["Sprint Burndown Chart", "Product Backlog", "Velocity Chart", "Gantt Chart"],
            "correct_index": 1,
            "explanation": "The Product Backlog is an ordered list of everything that is known to be needed in the product.",
            "source_citation": "MoE CS Blueprint: Agile Software Development",
        },
        {
            "question": "Which software testing technique evaluates internal code structures, branches, and execution paths rather than just input/output behavior?",
            "options": ["Black-box Testing", "White-box Testing", "Acceptance Testing", "Usability Testing"],
            "correct_index": 1,
            "explanation": "White-box (glass-box/structural) testing examines internal programming code logic, statement coverage, and branch coverage.",
            "source_citation": "MoE CS Blueprint: Software Quality Assurance & Testing",
        },
    ],

    # 4. COMPUTER NETWORKS
    "computer_networks": [
        {
            "question": "What is the primary function of the Address Resolution Protocol (ARP) in TCP/IP computer networking?",
            "options": [
                "Translate domain names into IP addresses",
                "Map an IP address (Network Layer) to a MAC address (Data Link Layer)",
                "Route packets across autonomous systems using BGP",
                "Establish reliable end-to-end transport connections",
            ],
            "correct_index": 1,
            "explanation": "ARP resolves an IPv4 address to a physical hardware MAC address on a local broadcast network segment.",
            "source_citation": "MoE CS Blueprint: Computer Networks",
        },
        {
            "question": "If an organization is assigned the IPv4 subnet 192.168.10.0/28, how many usable host IP addresses are available in this subnet?",
            "options": ["16", "14", "30", "32"],
            "correct_index": 1,
            "explanation": "A /28 prefix leaves 32 - 28 = 4 host bits. Total addresses = 2^4 = 16. Subtracting the network address and broadcast address leaves 16 - 2 = 14 usable host IPs.",
            "source_citation": "MoE CS Blueprint: IP Addressing & Subnetting",
        },
        {
            "question": "Which layer of the OSI model is responsible for end-to-end process communication, flow control, and error detection via TCP or UDP?",
            "options": ["Network Layer (Layer 3)", "Transport Layer (Layer 4)", "Session Layer (Layer 5)", "Data Link Layer (Layer 2)"],
            "correct_index": 1,
            "explanation": "Layer 4 (Transport Layer) manages end-to-end communication, packet segmentation, acknowledgment, and port multiplexing.",
            "source_citation": "MoE CS Blueprint: OSI & TCP/IP Reference Models",
        },
        {
            "question": "During the TCP 3-Way Handshake to establish a reliable connection, what is the correct sequence of control flags exchanged between client and server?",
            "options": [
                "ACK -> SYN -> SYN-ACK",
                "SYN -> SYN-ACK -> ACK",
                "SYN -> ACK -> FIN",
                "RST -> SYN -> ACK",
            ],
            "correct_index": 1,
            "explanation": "Client sends SYN, server responds with SYN-ACK, client acknowledges with ACK.",
            "source_citation": "MoE CS Blueprint: Transport Protocols",
        },
    ],

    # 5. OPERATING SYSTEMS
    "operating_systems": [
        {
            "question": "In Operating Systems, which of the following is NOT one of Coffman's four necessary conditions for deadlock?",
            "options": [
                "Mutual Exclusion",
                "Hold and Wait",
                "Preemption Allowed",
                "Circular Wait",
            ],
            "correct_index": 2,
            "explanation": "The condition is 'No Preemption' (resources cannot be forcibly taken away). If preemption is allowed, deadlocks can be avoided.",
            "source_citation": "MoE CS Blueprint: Operating Systems",
        },
        {
            "question": "Which CPU scheduling algorithm gives the minimum average waiting time for a given set of stationary processes?",
            "options": [
                "First-Come, First-Served (FCFS)",
                "Round Robin (RR)",
                "Shortest Job First (SJF) / Shortest Remaining Time First",
                "Priority Scheduling",
            ],
            "correct_index": 2,
            "explanation": "SJF is provably optimal in terms of minimizing average waiting time for a set of processes.",
            "source_citation": "MoE CS Blueprint: Process Scheduling",
        },
        {
            "question": "What phenomenon occurs in virtual memory when an operating system spends more time swapping pages in and out of secondary storage than executing actual processes?",
            "options": ["Fragmentation", "Thrashing", "Deadlock", "Segmentation Fault"],
            "correct_index": 1,
            "explanation": "Thrashing happens when the total working sets of active processes exceed available physical RAM, resulting in continuous page faults.",
            "source_citation": "MoE CS Blueprint: Virtual Memory & Paging",
        },
        {
            "question": "What is the primary role of a counting Semaphore in concurrent programming?",
            "options": [
                "To compile multi-threaded C code",
                "To provide synchronization and control access to a finite pool of shared resources",
                "To prevent RAM overheating",
                "To encrypt network traffic",
            ],
            "correct_index": 1,
            "explanation": "A semaphore is a synchronization primitive that maintains an integer counter to control access to shared critical resources by multiple threads.",
            "source_citation": "MoE CS Blueprint: Concurrency & Synchronization",
        },
    ],

    # 6. CYBERSECURITY & WEB APPLICATION SECURITY
    "cybersecurity": [
        {
            "question": "Which security vulnerability allows an attacker to inject malicious SQL commands into a form field or URL parameter to bypass authentication or extract sensitive database tables?",
            "options": [
                "Cross-Site Scripting (XSS)",
                "SQL Injection (SQLi)",
                "Cross-Site Request Forgery (CSRF)",
                "Buffer Overflow",
            ],
            "correct_index": 1,
            "explanation": "SQLi occurs when unvalidated user input is concatenated directly into SQL queries. It is prevented using Parameterized Queries (Prepared Statements).",
            "source_citation": "MoE CS Blueprint: Computer & Information Security",
        },
        {
            "question": "What is the fundamental difference between cryptographic hashing (e.g. SHA-256) and encryption (e.g. AES)?",
            "options": [
                "Hashing is two-way (reversible with a key), while encryption is strictly one-way",
                "Hashing is one-way (irreversible), while encryption is two-way (decryptable with a key)",
                "Hashing produces a variable length output, while encryption always produces 32 bytes",
                "Hashing requires an SSL certificate",
            ],
            "correct_index": 1,
            "explanation": "Cryptographic hashing maps arbitrary data to a fixed-size digest and cannot be reversed. Encryption is designed to be decrypted using the corresponding key.",
            "source_citation": "MoE CS Blueprint: Cryptography & Network Security",
        },
        {
            "question": "Which HTTP security header helps protect web applications against Cross-Site Scripting (XSS) attacks by restricting the origins from which scripts, styles, and images can be loaded?",
            "options": [
                "Content-Security-Policy (CSP)",
                "Strict-Transport-Security (HSTS)",
                "X-Frame-Options",
                "Access-Control-Allow-Origin",
            ],
            "correct_index": 0,
            "explanation": "Content-Security-Policy (CSP) allows server administrators to restrict the resources (such as JavaScript, CSS, Images) that the browser is allowed to load for a given page.",
            "source_citation": "MoE CS Blueprint: Web Application Security",
        },
    ],
}


def get_exit_exam_questions(category: str = "all") -> List[Dict[str, Any]]:
    """Fetches questions by department category or aggregates all."""
    cat = category.lower().strip()
    if cat in EXIT_EXAM_BANKS:
        return EXIT_EXAM_BANKS[cat]
    
    # Return aggregated tech list if "all", "computer_science", or "tech" requested
    all_questions = []
    for dept, questions in EXIT_EXAM_BANKS.items():
        all_questions.extend(questions)
    return all_questions
