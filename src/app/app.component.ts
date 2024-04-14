// Import the required dependencies
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from './api.service';
import { LoadingGifComponent } from './loading-gif/loading-gif.component';
import { Router } from '@angular/router';
import { HttpResponse } from '@angular/common/http';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
    title = 'VirtusaStoryBuilder';
    Functionality: any;
    UserStories: any;
    selectedFileName: string | null = null;
    fileToUpload: File | null = null;

    constructor(
        private apiService: ApiService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private router: Router
    ) {}

    ngOnInit(): void {
        sessionStorage.clear();
        localStorage.clear();
        // Load Functionality and User Stories from local storage if available
        const storedFunctionality = localStorage.getItem('functionality');
        const storedUserStories = localStorage.getItem('user_stories');
        if (storedFunctionality && storedUserStories) {
            this.Functionality = JSON.parse(storedFunctionality);
            this.UserStories = JSON.parse(storedUserStories);
        }
    }

    // Trigger file input
    triggerFileInput(): void {
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) {
            fileInput.click(); // Trigger file input click
        }
    }

    // Handle file selection
    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            // Update selected file name and file to upload
            this.selectedFileName = file.name;
            this.fileToUpload = file;
        } else {
            this.selectedFileName = null;
            this.fileToUpload = null;
        }
    }

    // Handle file submission
    onSubmit(): void {
        if (this.selectedFileName && this.fileToUpload) {
            console.log(`Submitting the selected file: ${this.selectedFileName}`);

            // Open the loading GIF dialog
            const dialogRef = this.dialog.open(LoadingGifComponent, {
                disableClose: true,
                panelClass: 'transparent-background',
            });

            // Call the API service to submit the file
            this.apiService.submitFile(this.selectedFileName, this.fileToUpload).subscribe(
                event => {
                    if (event instanceof HttpResponse) {
                        // Handle the response when the file upload is complete
                        
                        console.log('Response received:', event.body);

                        // Display success notification to the user
                        this.snackBar.open('BRD uploaded successfully, please wait for data processing.', 'Close', {
                            duration: 5000,
                            horizontalPosition: 'right',
                            verticalPosition: 'bottom',
                            panelClass: ['custom-snackbar', 'custom-snackbar-animate'],
                        });

                        // Fetch functionality data after successful file upload
                        this.apiService.fetchFunctionalityData().subscribe(
                            functionalityResponse => {
                                this.Functionality = functionalityResponse;
                                console.log('Functionality data fetched:', functionalityResponse);

                                // Store functionality data locally
                                localStorage.setItem('functionality', JSON.stringify(functionalityResponse));

                                // Fetch user stories data after successful file upload
                                this.apiService.fetchUserStoriesData().subscribe(
                                    userStoriesResponse => {
                                        this.UserStories = userStoriesResponse;
                                        console.log('User stories data fetched:', userStoriesResponse);

                                        // Store user stories data locally
                                        localStorage.setItem('user_stories', JSON.stringify(userStoriesResponse));
                                    },
                                    error => {
                                        console.error('Error fetching user stories data:', error);
                                    }
                                );
                                dialogRef.close();
                            },
                            error => {
                                console.error('Error fetching functionality data:', error);
                            }
                        );
                    }
                },
                error => {
                    // Close the dialog if an error occurs
                    dialogRef.close();
                    console.error('Error:', error);
                    // Display error notification
                    this.snackBar.open('An error occurred while submitting the file.', 'Close', {
                        duration: 3000,
                        horizontalPosition: 'right',
                        verticalPosition: 'bottom',
                        panelClass: ['custom-snackbar', 'custom-snackbar-animate'],
                    });
                }
            );
        } else {
            // Show a warning message if no file is selected
            this.snackBar.open('Please upload the BRD file.', 'Close', {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'bottom',
                panelClass: ['custom-snackbar', 'custom-snackbar-animate'],
            });
        }
    }

    // Helper functions
    getObjectValues(obj: any): any[] {
        return Object.entries(obj);
    }

    getKeys(obj: any): string[] {
        return Object.keys(obj);
    }

    navigateTo(route: string): void {
        this.router.navigate([route]);
    }
}
