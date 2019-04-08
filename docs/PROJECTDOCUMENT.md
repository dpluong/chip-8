# CMPT 276 Spring 2019 Group 8 CHIP8 Project

Group Members: Yiming Cai, Richard Fu, Gurnoor Grewal, Peter Luong, Anuvrat Sharma

This project document describes the conditions and planning of the product produced by the CMPT 276 Surrey Spring 2019 Group 8 Team.

The product being produced is a CHIP8 emulator, visualizer, a CHIP8 helper tool, and two CHIP8 games.

The purpose of this project is to help understand how to create applications in a team setting and will be used to show competence in the topics taught by CMPT 276.

The final release of the product is expected on April 8, 2019, with intermediate releases required as described in "Software Methodology & Timeframe".

# What's New?
Change log (Mar 13, 2019)
- Added what actually happened for Release 3
- Added schedule for Release 4

Change log (Feb 27, 2019)
- Added what actually happened for Release 2
- Added schedule for Release 3
- Updated overall schedule such that visualizer/tool will take all of Release 2/3

## In-person Meeting Times
The members of the team shall meet at least weekly for a period of at most 90 minutes every Monday after class. Meetings will by held in **room 3262** if possible.

If the room is already booked or otherwise not available, or if the scheduled meeting time for the week has changed, an alternative meeting time and/or spot shall by any group member via a post/message on all communication channels at least 24 hours before the scheduled meeting time.

If any member cannot make the meeting, they should let the team members know as soon as possible. Multiple unexcused absences will be considered as abandoning the project and will be handled accordingly.


## Communication Methods
The members of the team are members of a Facebook Messenger group chat for the purpose of discussing any issues or questions that may arise.

## Code Repository
All code and files relating to the project are hosted on a Git repository stored at Bitbucket. All team members will have access to it.

## Software Languages/Tools
The project will be coded using JavaScript, with an HTML/CSS frontend.

To facilitate testing and easier use of external libraries, Node.JS and the NPM package manager will also be used.

There is no required editor, and members will use any editor of their choice.

## Software Methodology & Timeframe
The project will be managed using an incremental development process, with 4 releases.

Each release date is as follows:
- Feb 6, 2019
- Feb 27, 2019
- Mar 13, 2019
- Apr 8, 2019
A general guide towards the expected state of the product for each release is located under "Release Overview".

The detailed plan and workflow for the next release shall be posted below the "Release Overview� and will be updated with the plan for the next release as the previous release is completed.

The roles each member has will be set only for one release at a time and may change after each release.

## Testing Frameworks
Mocha will be used as the testing framework for this project.

In addition, ESLint shall be used to ensure the code style is consistent. The code style shall be kept in sync with the code style used by Airbnb.

## QA Methods
All features need to have a test attached to it on Mocha.

In addition, if any bugs are found, a test needs to be created that tests that the bug is fixed.

All code shall be reviewed and approved by at least 50% of the group before it can be merged into the main master branch.

## Implementation Language & External Libraries
Any external libraries or code that is used shall be posted in the [EXTERNAL LIB LICENSES](./docs/EXTERNAL LIB LICENSES.md), along with their licenses. No external library or code shall be used that does not have a reasonable open source license, without the permission of all group members and the instructor.

## Release Overview
This shows the general overview and use cases for the products that will be released for the 4 releases.

Note that generally only the next release will have the major features & use cases listed.

Note that the product completion date is 2-3 days before the delivery date, to account for delays and bugfixes.

All team members shall only work on the features planned for the next release.

http://mattmik.com/files/chip8/mastering/chip8.html will be used as the referance material for CHIP8.

Release 1 (Product Delivery Feb 6, 2019) (Planned Product Completion by Feb 4, 2019):

- Emulator, major features and use cases include:
- A full CHIP8 emulator, capable of running any application **(Created under [Mattmik technical reference](http://mattmik.com/files/chip8/mastering/chip8.html)**
- A frontend to allow input of code and keyboard, with a display
- Users will be able to run any CHIP8 and interact with it using the emulator


Release 2/3:

Release 2: (Product Delivery Feb 27, 2019) (Planned Product Completion by Mar 25, 2019):
- Visualizer (Partial)
- Allows user to debug CHIP 8 programs
- Users will be able to see the registers, memory... of the CHIP 8 program

Release 3: (Product Delivery Mar 13, 2019) (Planned Product Completion by Mar 11, 2019):

- CHIP8 Tool (CHIP8 Assembly Language)
- A language of a higher level than the raw machine code
- A compiler that converts this language to CHIP8 machine code
- Users will be able to write human-readable code and compile it into CHIP8 machine code, ready for ues on any emulator
- Code Viewer for Visualizer
- Allows user to fully understand and debug CHIP 8 programs
- Can disassemble opcodes into a human readable form
- Users will be able to see the full code of the program they are running

Release 4 (Product Delivery Apr 8, 2019) (Planned Product Completion by Apr 5, 2019):

- Chip 8 Games

## Detailed Release 1 Plan & Schedule
Everyone will be working on the emulator for the first release. For now, all group members can work on any part of the emulator as they choose, as long other group members are aware of their selected role.

As the strengths of the group members are seen during the first release, members may be assigned to specific roles for future releases.

The plan shall be separated into weeks, with the separator being the weekly meetings.

For the first release, there are 3 weeks.

FINISH BY Week 1 (Jan 21, 2019):

- Project Document

Week 1 Meeting Agenda:

- Work on Project Presentation

Project Presentation (Jan 23, 2019):

- Presentation should be finished by 11AM

FINISH BY Week 2 (Jan 28, 2019):

- Around 25% of the emulator complete (Not expected to function at this stage)

Week 2 Meeting Agenda:

- Work on emulator (try for basic frontend and 50% of emulator complete)

FINISH BY Week 3 (Feb 4, 2019):

- Completed emulator frontend
- Completed emulator backend

Week 3 Meeting Agenda:

- Testing emulator and fixing bugs

Release 1 Due Date (Feb 6, 2019):

- Emulator production-ready and sent to the instructor

The items that were planned initally to be created for the emulator:

- Frontend Display
- Frontend CHIP8 Keyboard Input
- Frontend CHIP8 Code Input
- CHIP8 Code Parser
- Open framework for future visualizer work
- CHIP8 Virtual Machine, including...
    - Chip8 CPU (Stack, Registers)
    - Chip8 Memory
    - Chip8 Video Card
- Test code for all of the above items

The following items were completed for the emulator:

- Frontend Display
- Frontend CHIP8 Keyboard Input
- Frontend CHIP8 Code Input
- CHIP8 Virtual Machine, including...
    - Chip8 CPU (Stack, Registers)
    - Chip8 Memory
- Test code for emulator opcodes

Code Parser and Video Card were duplicates of other features and were removed from the final feature list.

## Detailed Release 2 Plan & Schedule
Everyone will be working on the tool for the second release. As having no roles was the most effective strategy for our team, for Release 2 there will continue to be no defined roles.

The plan shall be separated into weeks, with the separator being the weekly meetings on Mondays.

For the second release, there are 3 weeks.

This was the planned schedule initally:

FINISH BY Week 1 (Feb 11, 2019)
- Finish 50% of the tool including:
- The Parser :
    - The Input stream
    - The Token stream
    - The AST
- The Interpreter 

FINISH BY Week 2 (Feb 18, 2019) (Meeting day for this week may be changed due to Reading Break & other commitments):
-	Finish the rest of the tool including:
-	The Optimizer 
-	The Code generator 

FINISH BY Week 3 (Feb 25, 2019)
-	Test the compiler and fix bugs

Release 2 Due Date (Feb 27, 2019):
-	Higher level language and assembler production-ready and sent to the instructor

This is what actually happened:

FINISHED BY Week 1 (Feb 11, 2019)
- Finish 50% of the tool including:
- The Parser :
    - The Input stream
    - The Token stream
    - The AST

FINISHED BY Week 2 (Feb 18, 2019):
-	No work completed to snow

FINISH BY Week 3 (Feb 25, 2019)
-	Visualizer without code viewer complete
-   Partial assembler completed, but untested and without all opcodes completed

Release 2 Due Date (Feb 27, 2019):
-	Deliver the specification for the assembler language
-   Deliver the partial visualizer without code viewer
-   Deliver the incomplete assembler that is being worked on

## Detailed Release 3 Plan & Schedule
Due to unexpected snowstorms, the delivery of the assembler is deferred to the 3rd release.

To compensate for this, a visualizer has been delivered instead, but with no code viewer.

As the assembler language is required for the visualizer code viewer, this will be delievered in Release 3.

PERSON A, PERSON B, ..., and PERSON C will be working on the visualizer.

PERSON A, PERSON B, ..., and PERSON C will be working on the assembler.

FINISH BY Week 1 (Mar 4, 2019)
- If possible, assembler complete, but with no testing
- Otherwise, at least 50-70% of opcodes should be assemblable by the assembler

FINISH BY Week 2 (Mar 11, 2019):
- Disassembler for visualizer done
- Tests for the assembler complete
- Assembler complete for sure by this date

Release 3 Due Date (Mar 13, 2019):
-	Higher level language and assembler production-ready and sent to the instructor

All specifications listed above in release 3 were completed including:

- Visualizer fully complete with memory, registers, and instruction being executed shown:
	- Visualizer allows the program to be paused, be stepped-forward one instruction at a time, or be stepped backwards one instruction at a time.
	- Disassembler for visualizer done

- Assembler fully complete (Chip8 tool):
	- Delivered the specification for the assembler language
	- The Parser : Input stream, token stream, and AST
    - Assembler language with visualizer code viewer
	- Tests for the assembler complete

## Detailed Release 4 Plan & Schedule

Everyone will be working on the 2 games for release 4. As having no roles was the most effective strategy for our team, for Release 4 there will continue to be no defined roles. 2 or 3 people will work on each game. 

For the 4th release, there are about 3.5 weeks.

This is the planned schedule initally:

FINISH BY Week 1 (March 20, 2019)
- a simple puzzle/educational game for Chip8 using our assembler language

FINISH BY Week 2 (March 27, 2019):
- an action shooter game for Chip8 (similar to space invaders) using the Octo assembler 

FINISH BY Due Date (April 8, 2019)
- fix remaining bugs in any components of the project (games, assembler, etc.)
- keyboard input on emulator for playing games
- nicer looking UI for the HTML page (if time permits) 

## Final Release Features

 - A full CHIP8 emulator, capable of running any application :
   **(Created under [Mattmik technical reference](http://mattmik.com/files/chip8/mastering/chip8.html)**
    - A user-friendly frontend with button input for switching between emulator and tool, loading a program, enabling the visualizer,
      link to technical reference, and keyboard mappings
    - 32x64 px screen with ability to run any CHIP8 program and interact with it
    - On screen keyboard (used by clicking) and keyboard input 
    
- A Visualizer fully complete with memory, registers, and instruction being executed shown:
    - Visualizer allows the program to be paused, be stepped-forward one instruction at a time, or be stepped backwards one instruction at a time.
    - Disassembler for visualizer 

- Assembler fully complete (Chip8 tool):
    - Delivered the specification for the assembler language
    - The Parser : Input stream, token stream, and AST
    - Assembler language with visualizer code viewer
    - Tests for the assembler included
    - Ability to download the bytecode program file

- Two complete CHIP8 games:

  - An action shooter game called "Shooter" similar to "Space Invaders" created with our Assembler with rules to play in readme file
  - A puzzle game called "RulerBrain" similar to "Mastermind" created with Octo with rules to play in readme file