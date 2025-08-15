import EventForm from "@/components/forms/event-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const NewEventPage = () => {
    return (
        <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
                <CardTitle>
                    Create New Event
                </CardTitle>
            </CardHeader>
            <CardContent>
                <EventForm />
            </CardContent>
        </Card>
    );
}

export default NewEventPage;