import subprocess
import sys

subprocess.run(['flask', 'db', 'init'])

if len(sys.argv) > 1:
    migration_message = sys.argv[1]
else:
    migration_message = input("Enter the migration message: ")

subprocess.run(['flask', 'db', 'migrate', '-m', migration_message])
subprocess.run(['flask', 'db', 'upgrade'])

print("Database migration complete.")
