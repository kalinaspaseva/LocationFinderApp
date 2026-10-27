package mk.locationsfinder.controller;

import org.springframework.beans.factory.annotation.Value;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.Client;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gemini")
@CrossOrigin("*")
public class LocationsController {

    @Value("${gemini.api.key}")
    private String geminiKey;

    @GetMapping("/response")
    public ResponseEntity<GenerateContentResponse> getResponse(@RequestParam String text,
                                              @RequestParam String latitude,
                                              @RequestParam String longitude) {


        Client client = Client.builder().apiKey(geminiKey).build();

        String locationFormat = "{\n" +
                "  \"locations\": [\n" +
                "    {\n" +
                "      \"name\": \"Institute\",\n" +
                "      \"latitude\": 41.0315,\n" +
                "      \"longitude\": 21.3347,\n" +
                "      \"details\": \"Cafe bar in center of Kichevo\"\n" +
                "    },\n" +
                "    {\n" +
                "      \"name\": \"Kiko\",\n" +
                "      \"latitude\": 41.0115,\n" +
                "      \"longitude\": 21.3386,\n" +
                "      \"details\": \"Restaurant in Bitola square\"\n" +
                "    }\n" +
                "  ]\n" +
                "}\n";

        GenerateContentResponse response =
                client.models.generateContent(
                        "gemini-2.5-flash",
                        "Give me locations that are near " + latitude + ", " + longitude + " and match" +
                                " this text: " + text + " in JSON format: " + locationFormat + ", just send as plain text so I can read is with my JSON decoder, please do not say anything else. The locations MUST BE REAL.",
                        null);

        return ResponseEntity.ok(response);
    }
}
