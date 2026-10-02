const mongoose = require('mongoose');
const Challenge = require('../models/Challenge');
const QRBlock = require('../models/QRBlock');
const TestCase = require('../models/TestCase');
const User = require('../models/User');
const Submission = require('../models/Submission');
const ParticipantSession = require('../models/ParticipantSession');
const Settings = require('../models/Settings');
const env = require('../config/env');

const seedChallenges = async () => {
  try {
    console.log(`Connecting to MongoDB for seeding: ${env.MONGO_URI.replace(/:[^:@]+@/, ':***@')}`);
    await mongoose.connect(env.MONGO_URI);
    console.log('[Seed] Connected to MongoDB successfully.');

    // Seed Global Settings if not present
    let settings = await Settings.findOne();
    if (!settings) {
      await Settings.create({
        competitionName: 'MindCraft National Blind Coding Championship 2026',
        duration: 60,
        maxParticipants: 100,
        defaultChallengeTime: 20,
        revealPenalty: 5,
        wrongSubmissionPenalty: 2,
        leaderboardVisibility: 'Public',
      });
      console.log('[Seed] Settings initialized');
    }

    // ==========================================
    // CHALLENGE 1: Smart Expense Analyzer
    // ==========================================
    let expenseChal = await Challenge.findOne({ slug: 'smart-expense-analyzer' });
    const expenseSource = `import java.util.*;

public class Main {

    static double calculateTotal(double[] expenses) {
        double total = 0;

        for (double expense : expenses) {
            total += expense;
        }

        return total;
    }

    static double findHighest(double[] expenses) {
        double highest = expenses[0];

        for (double expense : expenses) {
            if (expense > highest) {
                highest = expense;
            }
        }

        return highest;
    }

    static double findLowest(double[] expenses) {
        double lowest = expenses[0];

        for (double expense : expenses) {
            if (expense < lowest) {
                lowest = expense;
            }
        }

        return lowest;
    }

    static int countAboveAverage(double[] expenses, double average) {
        int count = 0;

        for (double expense : expenses) {
            if (expense > average) {
                count++;
            }
        }

        return count;
    }

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);

        int n = sc.nextInt();

        if (n <= 0) {
            System.out.println("Invalid Input");
            return;
        }

        double[] expenses = new double[n];

        for (int i = 0; i < n; i++) {
            expenses[i] = sc.nextDouble();
        }

        double total = calculateTotal(expenses);
        double average = total / n;

        double highest = findHighest(expenses);
        double lowest = findLowest(expenses);

        int aboveAverage = countAboveAverage(expenses, average);

        System.out.printf("Total: %.2f%n", total);
        System.out.printf("Average: %.2f%n", average);
        System.out.printf("Highest: %.2f%n", highest);
        System.out.printf("Lowest: %.2f%n", lowest);
        System.out.println("Above Average: " + aboveAverage);

        sc.close();
    }
}`;

    const expenseTasks = [
      {
        taskId: 'task-1',
        title: 'Task 1: Input Setup',
        description: 'Prepare the program to read the expense count and expense values.',
        requiredBlockIds: ['B01', 'B06'],
        penalty: 5,
        order: 1,
      },
      {
        taskId: 'task-2',
        title: 'Task 2: Total Calculation',
        description: 'Build the calculation responsible for finding total spending.',
        requiredBlockIds: ['B02', 'B07'],
        penalty: 5,
        order: 2,
      },
      {
        taskId: 'task-3',
        title: 'Task 3: Min / Max Analysis',
        description: 'Create the logic that identifies the highest and lowest expense.',
        requiredBlockIds: ['B03', 'B04', 'B08'],
        penalty: 5,
        order: 3,
      },
      {
        taskId: 'task-4',
        title: 'Task 4: Average & Outliers',
        description: 'Calculate the average and identify expenses above the average.',
        requiredBlockIds: ['B05'],
        penalty: 5,
        order: 4,
      },
      {
        taskId: 'task-5',
        title: 'Task 5: Final Summary',
        description: 'Complete the final summary output.',
        requiredBlockIds: ['B09'],
        penalty: 5,
        order: 5,
      },
    ];

    if (!expenseChal) {
      expenseChal = await Challenge.create({
        title: 'Smart Expense Analyzer',
        slug: 'smart-expense-analyzer',
        category: 'Finance & Analytics',
        difficulty: 'Medium',
        points: 100,
        description: `Build a Java program that reads a list of expenses and analyzes the spending pattern.\n\nThe program should:\n1. Read the number of expenses.\n2. Read each expense amount.\n3. Calculate total spending.\n4. Calculate average spending.\n5. Find the highest expense.\n6. Find the lowest expense.\n7. Count how many expenses are above the average.\n8. Print a final spending summary.`,
        instructions: 'Complete each task by revealing required code blocks, arrange them on the assembly canvas, and execute test cases.',
        inputFormat: 'N followed by N expense amounts',
        outputFormat: 'Total, Average, Highest, Lowest, Above Average count formatted summary',
        constraints: '1 <= N <= 10^4, expense > 0',
        timeLimitSeconds: 1200,
        maxAttempts: 5,
        supportedLanguages: ['java', 'python', 'cpp', 'c'],
        sourceLanguage: 'java',
        sourceCode: expenseSource,
        splitStrategy: 'statement',
        status: 'Published',
        isActive: true,
        sampleInput: '5 100 200 50 300 150',
        sampleOutput: 'Total: 800.00\nAverage: 160.00\nHighest: 300.00\nLowest: 50.00\nAbove Average: 2',
        tasks: expenseTasks,
        blockConfig: {
          totalBlocks: 9,
          initialVisibleCount: 3,
          revealMode: 'task',
          revealPenalty: 5,
          wrongSubmissionPenalty: 2,
          maxReveals: 10,
          randomizeOrder: true,
          partialScoring: true,
        },
      });

      const expenseBlocks = [
        {
          blockId: 'B01',
          codeSnippet: `import java.util.*;\n\npublic class Main {`,
          originalOrder: 1,
          displayOrder: 4,
          taskId: 'task-1',
          blockType: 'WRAPPER',
          hint: 'Import statements and class declaration',
          isInitiallyVisible: true,
        },
        {
          blockId: 'B02',
          codeSnippet: `    static double calculateTotal(double[] expenses) {\n        double total = 0;\n\n        for (double expense : expenses) {\n            total += expense;\n        }\n\n        return total;\n    }`,
          originalOrder: 2,
          displayOrder: 7,
          taskId: 'task-2',
          blockType: 'FUNCTION',
          hint: 'Helper function to calculate total sum of expenses',
          isInitiallyVisible: false,
        },
        {
          blockId: 'B03',
          codeSnippet: `    static double findHighest(double[] expenses) {\n        double highest = expenses[0];\n\n        for (double expense : expenses) {\n            if (expense > highest) {\n                highest = expense;\n            }\n        }\n\n        return highest;\n    }`,
          originalOrder: 3,
          displayOrder: 2,
          taskId: 'task-3',
          blockType: 'FUNCTION',
          hint: 'Helper function to find maximum expense',
          isInitiallyVisible: true,
        },
        {
          blockId: 'B04',
          codeSnippet: `    static double findLowest(double[] expenses) {\n        double lowest = expenses[0];\n\n        for (double expense : expenses) {\n            if (expense < lowest) {\n                lowest = expense;\n            }\n        }\n\n        return lowest;\n    }`,
          originalOrder: 4,
          displayOrder: 8,
          taskId: 'task-3',
          blockType: 'FUNCTION',
          hint: 'Helper function to find minimum expense',
          isInitiallyVisible: false,
        },
        {
          blockId: 'B05',
          codeSnippet: `    static int countAboveAverage(double[] expenses, double average) {\n        int count = 0;\n\n        for (double expense : expenses) {\n            if (expense > average) {\n                count++;\n            }\n        }\n\n        return count;\n    }`,
          originalOrder: 5,
          displayOrder: 6,
          taskId: 'task-4',
          blockType: 'FUNCTION',
          hint: 'Helper function counting expenses above average',
          isInitiallyVisible: false,
        },
        {
          blockId: 'B06',
          codeSnippet: `    public static void main(String[] args) {\n\n        Scanner sc = new Scanner(System.in);\n\n        int n = sc.nextInt();\n\n        if (n <= 0) {\n            System.out.println("Invalid Input");\n            return;\n        }\n\n        double[] expenses = new double[n];\n\n        for (int i = 0; i < n; i++) {\n            expenses[i] = sc.nextDouble();\n        }`,
          originalOrder: 6,
          displayOrder: 1,
          taskId: 'task-1',
          blockType: 'INIT',
          hint: 'Main method entry and array input loop',
          isInitiallyVisible: true,
        },
        {
          blockId: 'B07',
          codeSnippet: `        double total = calculateTotal(expenses);\n        double average = total / n;`,
          originalOrder: 7,
          displayOrder: 9,
          taskId: 'task-2',
          blockType: 'LOGIC',
          hint: 'Compute total and average values',
          isInitiallyVisible: false,
        },
        {
          blockId: 'B08',
          codeSnippet: `        double highest = findHighest(expenses);\n        double lowest = findLowest(expenses);\n\n        int aboveAverage = countAboveAverage(expenses, average);`,
          originalOrder: 8,
          displayOrder: 3,
          taskId: 'task-3',
          blockType: 'LOGIC',
          hint: 'Execute min/max and above-average analysis',
          isInitiallyVisible: false,
        },
        {
          blockId: 'B09',
          codeSnippet: `        System.out.printf("Total: %.2f%n", total);\n        System.out.printf("Average: %.2f%n", average);\n        System.out.printf("Highest: %.2f%n", highest);\n        System.out.printf("Lowest: %.2f%n", lowest);\n        System.out.println("Above Average: " + aboveAverage);\n\n        sc.close();\n    }\n}`,
          originalOrder: 9,
          displayOrder: 5,
          taskId: 'task-5',
          blockType: 'OUTPUT',
          hint: 'Formatted summary print statements and program closure',
          isInitiallyVisible: false,
        },
      ];

      await QRBlock.insertMany(
        expenseBlocks.map((b) => ({
          ...b,
          challengeId: expenseChal._id,
          language: 'java',
          qrHash: `MC-EXPENSE-${b.blockId}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          points: 10,
        }))
      );

      await TestCase.create([
        {
          challengeId: expenseChal._id,
          input: '5 100 200 50 300 150',
          expectedOutput: 'Total: 800.00\nAverage: 160.00\nHighest: 300.00\nLowest: 50.00\nAbove Average: 2',
          isHidden: false,
          weight: 20,
          description: 'Standard 5 expenses sample',
        },
        {
          challengeId: expenseChal._id,
          input: '3 50.5 49.5 100',
          expectedOutput: 'Total: 200.00\nAverage: 66.67\nHighest: 100.00\nLowest: 49.50\nAbove Average: 1',
          isHidden: false,
          weight: 20,
          description: 'Decimal expenses',
        },
        {
          challengeId: expenseChal._id,
          input: '0',
          expectedOutput: 'Invalid Input',
          isHidden: false,
          weight: 20,
          description: 'Edge case: zero expenses',
        },
        {
          challengeId: expenseChal._id,
          input: '4 10 10 10 10',
          expectedOutput: 'Total: 40.00\nAverage: 10.00\nHighest: 10.00\nLowest: 10.00\nAbove Average: 0',
          isHidden: true,
          weight: 20,
          description: 'Uniform expenses (no above average)',
        },
        {
          challengeId: expenseChal._id,
          input: '6 12.5 88.0 45.5 120.0 5.0 99.0',
          expectedOutput: 'Total: 370.00\nAverage: 61.67\nHighest: 120.00\nLowest: 5.00\nAbove Average: 3',
          isHidden: true,
          weight: 20,
          description: '6 varied values',
        },
      ]);

      console.log('[Seed] Challenge 1: Smart Expense Analyzer seeded successfully');
    }

    // ==========================================
    // CHALLENGE 2: Movie Recommendation Engine
    // ==========================================
    let movieChal = await Challenge.findOne({ slug: 'movie-recommendation-engine' });
    const movieSource = `import java.util.*;

class Movie {

    String name;
    String genre;
    double rating;

    Movie(String name, String genre, double rating) {
        this.name = name;
        this.genre = genre;
        this.rating = rating;
    }
}

public class Main {

    static ArrayList<Movie> createMovies() {

        ArrayList<Movie> movies = new ArrayList<>();

        movies.add(new Movie("Interstellar", "SciFi", 8.7));
        movies.add(new Movie("Inception", "SciFi", 8.8));
        movies.add(new Movie("The Dark Knight", "Action", 9.0));
        movies.add(new Movie("Whiplash", "Drama", 8.5));
        movies.add(new Movie("The Martian", "SciFi", 8.0));
        movies.add(new Movie("Avengers Endgame", "Action", 8.4));
        movies.add(new Movie("Parasite", "Drama", 8.5));
        movies.add(new Movie("Blade Runner 2049", "SciFi", 8.0));

        return movies;
    }

    static ArrayList<Movie> recommend(
            ArrayList<Movie> movies,
            String preferredGenre,
            double minimumRating) {

        ArrayList<Movie> recommendations = new ArrayList<>();

        for (Movie movie : movies) {

            if (movie.genre.equalsIgnoreCase(preferredGenre)
                    && movie.rating >= minimumRating) {

                recommendations.add(movie);
            }
        }

        recommendations.sort(
                (a, b) -> Double.compare(b.rating, a.rating)
        );

        return recommendations;
    }

    static void printRecommendations(
            ArrayList<Movie> recommendations) {

        if (recommendations.isEmpty()) {
            System.out.println("No recommendations found.");
            return;
        }

        System.out.println("Recommended Movies:");

        for (Movie movie : recommendations) {

            System.out.printf(
                    "%s - %.1f%n",
                    movie.name,
                    movie.rating
            );
        }
    }

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);

        ArrayList<Movie> movies = createMovies();

        String genre = sc.nextLine();

        double minimumRating = sc.nextDouble();

        ArrayList<Movie> recommendations =
                recommend(
                        movies,
                        genre,
                        minimumRating
                );

        printRecommendations(recommendations);

        sc.close();
    }
}`;

    const movieTasks = [
      {
        taskId: 'task-1',
        title: 'Task 1: Movie Data Model',
        description: 'Create the Movie data structure.',
        requiredBlockIds: ['B01'],
        penalty: 5,
        order: 1,
      },
      {
        taskId: 'task-2',
        title: 'Task 2: Seed Movie Catalog',
        description: 'Prepare the movie database.',
        requiredBlockIds: ['B02'],
        penalty: 5,
        order: 2,
      },
      {
        taskId: 'task-3',
        title: 'Task 3: Filter By Genre & Rating',
        description: 'Filter movies using genre and minimum rating.',
        requiredBlockIds: ['B03'],
        penalty: 5,
        order: 3,
      },
      {
        taskId: 'task-4',
        title: 'Task 4: Sort Descending By Rating',
        description: 'Sort recommendations from highest rating to lowest.',
        requiredBlockIds: ['B04'],
        penalty: 5,
        order: 4,
      },
      {
        taskId: 'task-5',
        title: 'Task 5: Present Results',
        description: 'Display the final recommendations.',
        requiredBlockIds: ['B05', 'B06'],
        penalty: 5,
        order: 5,
      },
    ];

    if (!movieChal) {
      movieChal = await Challenge.create({
        title: 'Movie Recommendation Engine',
        slug: 'movie-recommendation-engine',
        category: 'OOP & Collections',
        difficulty: 'Medium',
        points: 120,
        description: `Create a simple movie recommendation engine.\n\nThe program receives movie information and a user's preferred genre and minimum rating.\nIt should:\n- Store movie names, genres, and ratings\n- Filter movies by genre and minimum rating\n- Sort matching movies by rating descending\n- Display recommendations or a not-found message`,
        instructions: 'Unlock the OOP blocks, arrange the recommendation filter and sorter, and execute.',
        inputFormat: 'Preferred Genre\\nMinimum Rating',
        outputFormat: 'List of matching movies sorted by rating',
        constraints: 'Case-insensitive genre comparison',
        timeLimitSeconds: 1200,
        maxAttempts: 5,
        supportedLanguages: ['java', 'python', 'cpp', 'c'],
        sourceLanguage: 'java',
        sourceCode: movieSource,
        splitStrategy: 'statement',
        status: 'Published',
        isActive: true,
        sampleInput: 'SciFi\n8.5',
        sampleOutput: 'Recommended Movies:\nInception - 8.8\nInterstellar - 8.7',
        tasks: movieTasks,
        blockConfig: {
          totalBlocks: 6,
          initialVisibleCount: 2,
          revealMode: 'task',
          revealPenalty: 5,
          wrongSubmissionPenalty: 2,
          maxReveals: 8,
          randomizeOrder: true,
          partialScoring: true,
        },
      });

      const movieBlocks = [
        {
          blockId: 'B01',
          codeSnippet: `import java.util.*;\n\nclass Movie {\n\n    String name;\n    String genre;\n    double rating;\n\n    Movie(String name, String genre, double rating) {\n        this.name = name;\n        this.genre = genre;\n        this.rating = rating;\n    }\n}`,
          originalOrder: 1,
          displayOrder: 3,
          taskId: 'task-1',
          blockType: 'WRAPPER',
          hint: 'Movie model class definition',
          isInitiallyVisible: true,
        },
        {
          blockId: 'B02',
          codeSnippet: `public class Main {\n\n    static ArrayList<Movie> createMovies() {\n\n        ArrayList<Movie> movies = new ArrayList<>();\n\n        movies.add(new Movie("Interstellar", "SciFi", 8.7));\n        movies.add(new Movie("Inception", "SciFi", 8.8));\n        movies.add(new Movie("The Dark Knight", "Action", 9.0));\n        movies.add(new Movie("Whiplash", "Drama", 8.5));\n        movies.add(new Movie("The Martian", "SciFi", 8.0));\n        movies.add(new Movie("Avengers Endgame", "Action", 8.4));\n        movies.add(new Movie("Parasite", "Drama", 8.5));\n        movies.add(new Movie("Blade Runner 2049", "SciFi", 8.0));\n\n        return movies;\n    }`,
          originalOrder: 2,
          displayOrder: 6,
          taskId: 'task-2',
          blockType: 'FUNCTION',
          hint: 'Main class header and catalog database generator',
          isInitiallyVisible: false,
        },
        {
          blockId: 'B03',
          codeSnippet: `    static ArrayList<Movie> recommend(\n            ArrayList<Movie> movies,\n            String preferredGenre,\n            double minimumRating) {\n\n        ArrayList<Movie> recommendations = new ArrayList<>();\n\n        for (Movie movie : movies) {\n\n            if (movie.genre.equalsIgnoreCase(preferredGenre)\n                    && movie.rating >= minimumRating) {\n\n                recommendations.add(movie);\n            }\n        }`,
          originalOrder: 3,
          displayOrder: 1,
          taskId: 'task-3',
          blockType: 'FUNCTION',
          hint: 'Filter loop matching genre and threshold rating',
          isInitiallyVisible: true,
        },
        {
          blockId: 'B04',
          codeSnippet: `        recommendations.sort(\n                (a, b) -> Double.compare(b.rating, a.rating)\n        );\n\n        return recommendations;\n    }`,
          originalOrder: 4,
          displayOrder: 5,
          taskId: 'task-4',
          blockType: 'LOGIC',
          hint: 'Sort recommendations descending by rating',
          isInitiallyVisible: false,
        },
        {
          blockId: 'B05',
          codeSnippet: `    static void printRecommendations(\n            ArrayList<Movie> recommendations) {\n\n        if (recommendations.isEmpty()) {\n            System.out.println("No recommendations found.");\n            return;\n        }\n\n        System.out.println("Recommended Movies:");\n\n        for (Movie movie : recommendations) {\n\n            System.out.printf(\n                    "%s - %.1f%n",\n                    movie.name,\n                    movie.rating\n            );\n        }\n    }`,
          originalOrder: 5,
          displayOrder: 4,
          taskId: 'task-5',
          blockType: 'OUTPUT',
          hint: 'Formatted recommendations print logic',
          isInitiallyVisible: false,
        },
        {
          blockId: 'B06',
          codeSnippet: `    public static void main(String[] args) {\n\n        Scanner sc = new Scanner(System.in);\n\n        ArrayList<Movie> movies = createMovies();\n\n        String genre = sc.nextLine();\n\n        double minimumRating = sc.nextDouble();\n\n        ArrayList<Movie> recommendations =\n                recommend(\n                        movies,\n                        genre,\n                        minimumRating\n                );\n\n        printRecommendations(recommendations);\n\n        sc.close();\n    }\n}`,
          originalOrder: 6,
          displayOrder: 2,
          taskId: 'task-5',
          blockType: 'INIT',
          hint: 'Main execution flow: parse input, run recommendation, display',
          isInitiallyVisible: false,
        },
      ];

      await QRBlock.insertMany(
        movieBlocks.map((b) => ({
          ...b,
          challengeId: movieChal._id,
          language: 'java',
          qrHash: `MC-MOVIE-${b.blockId}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          points: 20,
        }))
      );

      await TestCase.create([
        {
          challengeId: movieChal._id,
          input: 'SciFi\n8.5',
          expectedOutput: 'Recommended Movies:\nInception - 8.8\nInterstellar - 8.7',
          isHidden: false,
          weight: 30,
          description: 'SciFi with 8.5 threshold',
        },
        {
          challengeId: movieChal._id,
          input: 'Action\n8.0',
          expectedOutput: 'Recommended Movies:\nThe Dark Knight - 9.0\nAvengers Endgame - 8.4',
          isHidden: false,
          weight: 30,
          description: 'Action movies >= 8.0',
        },
        {
          challengeId: movieChal._id,
          input: 'Animation\n7.0',
          expectedOutput: 'No recommendations found.',
          isHidden: false,
          weight: 30,
          description: 'Genre not in database',
        },
        {
          challengeId: movieChal._id,
          input: 'Drama\n8.5',
          expectedOutput: 'Recommended Movies:\nWhiplash - 8.5\nParasite - 8.5',
          isHidden: true,
          weight: 30,
          description: 'Drama movies matching exact threshold',
        },
      ]);

      console.log('[Seed] Challenge 2: Movie Recommendation Engine seeded successfully');
    }

    // ==========================================
    // CHALLENGE 3: Campus Event Seat Manager
    // ==========================================
    let seatChal = await Challenge.findOne({ slug: 'campus-event-seat-manager' });
    const seatSource = `import java.util.*;

class Reservation {

    String studentId;
    String studentName;
    int seatNumber;

    Reservation(
            String studentId,
            String studentName,
            int seatNumber) {

        this.studentId = studentId;
        this.studentName = studentName;
        this.seatNumber = seatNumber;
    }
}

public class Main {

    static final int TOTAL_SEATS = 50;

    static HashMap<Integer, Reservation> reservations =
            new HashMap<>();

    static HashSet<String> registeredStudents =
            new HashSet<>();

    static boolean reserveSeat(
            String studentId,
            String studentName,
            int seatNumber) {

        if (seatNumber < 1 || seatNumber > TOTAL_SEATS) {
            return false;
        }

        if (reservations.containsKey(seatNumber)) {
            return false;
        }

        if (registeredStudents.contains(studentId)) {
            return false;
        }

        Reservation reservation =
                new Reservation(
                        studentId,
                        studentName,
                        seatNumber
                );

        reservations.put(seatNumber, reservation);
        registeredStudents.add(studentId);

        return true;
    }

    static boolean cancelReservation(int seatNumber) {

        if (!reservations.containsKey(seatNumber)) {
            return false;
        }

        Reservation reservation =
                reservations.remove(seatNumber);

        registeredStudents.remove(
                reservation.studentId
        );

        return true;
    }

    static void printAvailableSeats() {

        System.out.println("Available Seats:");

        for (int i = 1; i <= TOTAL_SEATS; i++) {

            if (!reservations.containsKey(i)) {
                System.out.print(i + " ");
            }
        }

        System.out.println();
    }

    static double calculateOccupancy() {

        return
                ((double) reservations.size()
                        / TOTAL_SEATS) * 100;
    }

    static void printSummary() {

        System.out.println();
        System.out.println("===== EVENT SUMMARY =====");

        System.out.println(
                "Reserved Seats: "
                        + reservations.size()
        );

        System.out.println(
                "Available Seats: "
                        + (TOTAL_SEATS
                        - reservations.size())
        );

        System.out.printf(
                "Occupancy: %.2f%%%n",
                calculateOccupancy()
        );

        System.out.println(
                "Registered Students: "
                        + registeredStudents.size()
        );
    }

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);

        int operations = sc.nextInt();

        for (int i = 0; i < operations; i++) {

            int operation = sc.nextInt();

            if (operation == 1) {

                String studentId = sc.next();
                String studentName = sc.next();
                int seatNumber = sc.nextInt();

                boolean success =
                        reserveSeat(
                                studentId,
                                studentName,
                                seatNumber
                        );

                System.out.println(
                        success
                                ? "Reservation Successful"
                                : "Reservation Failed"
                );

            } else if (operation == 2) {

                int seatNumber = sc.nextInt();

                boolean success =
                        cancelReservation(seatNumber);

                System.out.println(
                        success
                                ? "Cancellation Successful"
                                : "Cancellation Failed"
                );

            } else if (operation == 3) {

                printAvailableSeats();

            } else {

                System.out.println("Invalid Operation");
            }
        }

        printSummary();

        sc.close();
    }
}`;

    const seatTasks = [
      {
        taskId: 'task-1',
        title: 'Task 1: Reservation Model & Storage',
        description: 'Create the reservation data model and storage.',
        requiredBlockIds: ['B01', 'B02'],
        penalty: 5,
        order: 1,
      },
      {
        taskId: 'task-2',
        title: 'Task 2: Seat Reservation Logic',
        description: 'Implement seat reservation with duplicate protection.',
        requiredBlockIds: ['B03'],
        penalty: 5,
        order: 2,
      },
      {
        taskId: 'task-3',
        title: 'Task 3: Cancellation Routine',
        description: 'Implement reservation cancellation.',
        requiredBlockIds: ['B04'],
        penalty: 5,
        order: 3,
      },
      {
        taskId: 'task-4',
        title: 'Task 4: Availability & Occupancy',
        description: 'Display available seats and calculate occupancy.',
        requiredBlockIds: ['B05'],
        penalty: 5,
        order: 4,
      },
      {
        taskId: 'task-5',
        title: 'Task 5: Main Driver Loop',
        description: 'Connect all operations to the main program.',
        requiredBlockIds: ['B07'],
        penalty: 5,
        order: 5,
      },
      {
        taskId: 'task-6',
        title: 'Task 6: Event Summary',
        description: 'Generate the final event summary.',
        requiredBlockIds: ['B06'],
        penalty: 5,
        order: 6,
      },
    ];

    if (!seatChal) {
      seatChal = await Challenge.create({
        title: 'Campus Event Seat Manager',
        slug: 'campus-event-seat-manager',
        category: 'Data Structures',
        difficulty: 'Hard',
        points: 150,
        description: `Build a campus event seat reservation system.\n\nThe system should:\n- Maintain available seats (50 total)\n- Reserve seats and prevent duplicate student/seat reservations\n- Cancel reservations and release seats\n- Show available seats\n- Calculate occupancy percentage\n- Display final reservation summary`,
        instructions: 'Assemble the reservation data structures, collision checks, and command processor.',
        inputFormat: 'Operations count followed by operation commands (1=Reserve, 2=Cancel, 3=Print)',
        outputFormat: 'Operation success/failure confirmations and final summary banner',
        constraints: '1 <= seat <= 50, unique studentId',
        timeLimitSeconds: 1500,
        maxAttempts: 5,
        supportedLanguages: ['java', 'python', 'cpp', 'c'],
        sourceLanguage: 'java',
        sourceCode: seatSource,
        splitStrategy: 'statement',
        status: 'Published',
        isActive: true,
        sampleInput: '3\n1 S101 Alice 5\n1 S102 Bob 5\n1 S103 Charlie 12',
        sampleOutput: 'Reservation Successful\nReservation Failed\nReservation Successful\n\n===== EVENT SUMMARY =====\nReserved Seats: 2\nAvailable Seats: 48\nOccupancy: 4.00%\nRegistered Students: 2',
        tasks: seatTasks,
        blockConfig: {
          totalBlocks: 7,
          initialVisibleCount: 2,
          revealMode: 'task',
          revealPenalty: 5,
          wrongSubmissionPenalty: 2,
          maxReveals: 10,
          randomizeOrder: true,
          partialScoring: true,
        },
      });

      const seatBlocks = [
        {
          blockId: 'B01',
          codeSnippet: `import java.util.*;\n\nclass Reservation {\n\n    String studentId;\n    String studentName;\n    int seatNumber;\n\n    Reservation(\n            String studentId,\n            String studentName,\n            int seatNumber) {\n\n        this.studentId = studentId;\n        this.studentName = studentName;\n        this.seatNumber = seatNumber;\n    }\n}`,
          originalOrder: 1,
          displayOrder: 4,
          taskId: 'task-1',
          blockType: 'WRAPPER',
          hint: 'Reservation record structure',
          isInitiallyVisible: true,
        },
        {
          blockId: 'B02',
          codeSnippet: `public class Main {\n\n    static final int TOTAL_SEATS = 50;\n\n    static HashMap<Integer, Reservation> reservations =\n            new HashMap<>();\n\n    static HashSet<String> registeredStudents =\n            new HashSet<>();`,
          originalOrder: 2,
          displayOrder: 2,
          taskId: 'task-1',
          blockType: 'INIT',
          hint: 'Main class and static reservation storage HashMaps',
          isInitiallyVisible: true,
        },
        {
          blockId: 'B03',
          codeSnippet: `    static boolean reserveSeat(\n            String studentId,\n            String studentName,\n            int seatNumber) {\n\n        if (seatNumber < 1 || seatNumber > TOTAL_SEATS) {\n            return false;\n        }\n\n        if (reservations.containsKey(seatNumber)) {\n            return false;\n        }\n\n        if (registeredStudents.contains(studentId)) {\n            return false;\n        }\n\n        Reservation reservation =\n                new Reservation(\n                        studentId,\n                        studentName,\n                        seatNumber\n                );\n\n        reservations.put(seatNumber, reservation);\n        registeredStudents.add(studentId);\n\n        return true;\n    }`,
          originalOrder: 3,
          displayOrder: 7,
          taskId: 'task-2',
          blockType: 'FUNCTION',
          hint: 'Seat reservation method with range and duplicate protection',
          isInitiallyVisible: false,
        },
        {
          blockId: 'B04',
          codeSnippet: `    static boolean cancelReservation(int seatNumber) {\n\n        if (!reservations.containsKey(seatNumber)) {\n            return false;\n        }\n\n        Reservation reservation =\n                reservations.remove(seatNumber);\n\n        registeredStudents.remove(\n                reservation.studentId\n        );\n\n        return true;\n    }`,
          originalOrder: 4,
          displayOrder: 5,
          taskId: 'task-3',
          blockType: 'FUNCTION',
          hint: 'Seat cancellation logic and state cleanup',
          isInitiallyVisible: false,
        },
        {
          blockId: 'B05',
          codeSnippet: `    static void printAvailableSeats() {\n\n        System.out.println("Available Seats:");\n\n        for (int i = 1; i <= TOTAL_SEATS; i++) {\n\n            if (!reservations.containsKey(i)) {\n                System.out.print(i + " ");\n            }\n        }\n\n        System.out.println();\n    }\n\n    static double calculateOccupancy() {\n\n        return\n                ((double) reservations.size()\n                        / TOTAL_SEATS) * 100;\n    }`,
          originalOrder: 5,
          displayOrder: 1,
          taskId: 'task-4',
          blockType: 'FUNCTION',
          hint: 'Seat display loop and occupancy percentage calculator',
          isInitiallyVisible: false,
        },
        {
          blockId: 'B06',
          codeSnippet: `    static void printSummary() {\n\n        System.out.println();\n        System.out.println("===== EVENT SUMMARY =====");\n\n        System.out.println(\n                "Reserved Seats: "\n                        + reservations.size()\n        );\n\n        System.out.println(\n                "Available Seats: "\n                        + (TOTAL_SEATS\n                        - reservations.size())\n        );\n\n        System.out.printf(\n                "Occupancy: %.2f%%%n",\n                calculateOccupancy()\n        );\n\n        System.out.println(\n                "Registered Students: "\n                        + registeredStudents.size()\n        );\n    }`,
          originalOrder: 6,
          displayOrder: 6,
          taskId: 'task-6',
          blockType: 'OUTPUT',
          hint: 'Event summary generation method',
          isInitiallyVisible: false,
        },
        {
          blockId: 'B07',
          codeSnippet: `    public static void main(String[] args) {\n\n        Scanner sc = new Scanner(System.in);\n\n        int operations = sc.nextInt();\n\n        for (int i = 0; i < operations; i++) {\n\n            int operation = sc.nextInt();\n\n            if (operation == 1) {\n\n                String studentId = sc.next();\n                String studentName = sc.next();\n                int seatNumber = sc.nextInt();\n\n                boolean success =\n                        reserveSeat(\n                                studentId,\n                                studentName,\n                                seatNumber\n                        );\n\n                System.out.println(\n                        success\n                                ? "Reservation Successful"\n                                : "Reservation Failed"\n                );\n\n            } else if (operation == 2) {\n\n                int seatNumber = sc.nextInt();\n\n                boolean success =\n                        cancelReservation(seatNumber);\n\n                System.out.println(\n                        success\n                                ? "Cancellation Successful"\n                                : "Cancellation Failed"\n                );\n\n            } else if (operation == 3) {\n\n                printAvailableSeats();\n\n            } else {\n\n                System.out.println("Invalid Operation");\n            }\n        }\n\n        printSummary();\n\n        sc.close();\n    }\n}`,
          originalOrder: 7,
          displayOrder: 3,
          taskId: 'task-5',
          blockType: 'INIT',
          hint: 'Operation dispatcher loop reading commands and running actions',
          isInitiallyVisible: false,
        },
      ];

      await QRBlock.insertMany(
        seatBlocks.map((b) => ({
          ...b,
          challengeId: seatChal._id,
          language: 'java',
          qrHash: `MC-SEAT-${b.blockId}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          points: 25,
        }))
      );

      await TestCase.create([
        {
          challengeId: seatChal._id,
          input: '3\n1 S101 Alice 5\n1 S102 Bob 5\n1 S103 Charlie 12',
          expectedOutput: 'Reservation Successful\nReservation Failed\nReservation Successful\n\n===== EVENT SUMMARY =====\nReserved Seats: 2\nAvailable Seats: 48\nOccupancy: 4.00%\nRegistered Students: 2',
          isHidden: false,
          weight: 50,
          description: 'Duplicate seat rejection test',
        },
        {
          challengeId: seatChal._id,
          input: '2\n1 S201 Dave 10\n2 10',
          expectedOutput: 'Reservation Successful\nCancellation Successful\n\n===== EVENT SUMMARY =====\nReserved Seats: 0\nAvailable Seats: 50\nOccupancy: 0.00%\nRegistered Students: 0',
          isHidden: false,
          weight: 50,
          description: 'Reserve then cancel test',
        },
        {
          challengeId: seatChal._id,
          input: '3\n1 S301 Emma 1\n1 S301 Emma 2\n3',
          expectedOutput: 'Reservation Successful\nReservation Failed\nAvailable Seats:\n2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 \n\n===== EVENT SUMMARY =====\nReserved Seats: 1\nAvailable Seats: 49\nOccupancy: 2.00%\nRegistered Students: 1',
          isHidden: true,
          weight: 50,
          description: 'Duplicate student registration prevention',
        },
      ]);

      console.log('[Seed] Challenge 3: Campus Event Seat Manager seeded successfully');
    }

    // Seed realistic participant users if none exist
    const participantCount = await User.countDocuments({ role: 'participant' });
    if (participantCount === 0) {
      const sampleContestants = [
        { name: 'Arun Kumar', email: 'arun@college.edu', teamName: 'BinaryBeasts', college: 'MIT Campus' },
        { name: 'Priya Sundaram', email: 'priya@tech.edu', teamName: 'CodeValkyries', college: 'Anna University' },
        { name: 'Rohit Verma', email: 'rohit@iit.ac.in', teamName: 'NullPointers', college: 'IIT Madras' },
        { name: 'Deepa Krishnan', email: 'deepa@ceg.edu', teamName: 'ByteForce', college: 'College of Eng Guindy' },
        { name: 'Siddharth Nair', email: 'sid@nit.edu', teamName: 'GlitchHunters', college: 'NIT Trichy' },
      ];

      for (const c of sampleContestants) {
        const u = await User.create({
          ...c,
          password: 'Password123!',
          role: 'participant',
        });

        // Add a session and submission for activity
        await ParticipantSession.create({
          userId: u._id,
          challengeId: expenseChal._id,
          startTime: new Date(Date.now() - Math.floor(Math.random() * 800) * 1000),
          durationSeconds: 1200,
          revealsCount: Math.floor(Math.random() * 3),
          scoreAwarded: 95,
          status: 'ACTIVE',
        });

        await Submission.create({
          userId: u._id,
          challengeId: expenseChal._id,
          code: expenseChal.sourceCode,
          language: 'java',
          status: 'ACCEPTED',
          testCasesPassed: 5,
          totalTestCases: 5,
          score: 95,
          executionTimeMs: 124,
        });
      }
      console.log('[Seed] Sample contestants and active sessions seeded');
    }

    await mongoose.disconnect();
    console.log('[Seed] Database initialization completed successfully.');
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  seedChallenges();
}

module.exports = seedChallenges;
